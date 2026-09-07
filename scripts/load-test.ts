import crypto from 'node:crypto';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { PrismaClient, type ProductStatus } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

type Budget = {
	p95Ms: number;
	maxErrorRatePct: number;
};

type RequestDescriptor = {
	url: string;
	init: RequestInit;
	expectStatus: (status: number) => boolean;
};

type Scenario = {
	key: string;
	label: string;
	durationMs: number;
	concurrency: number;
	budget: Budget;
	makeRequest: (ctx: { workerId: number; iteration: number }) => RequestDescriptor;
};

type ScenarioResult = {
	key: string;
	label: string;
	totalRequests: number;
	failedRequests: number;
	errorRatePct: number;
	rps: number;
	p50Ms: number;
	p95Ms: number;
	p99Ms: number;
	maxMs: number;
	budget: Budget;
	p95BudgetPass: boolean;
	errorBudgetPass: boolean;
	pass: boolean;
	statusCounts: Array<{ status: number; count: number }>;
	errorSamples: string[];
};

type CliOptions = {
	storeBaseUrl: string;
	adminBaseUrl: string;
	durationSeconds: number;
};

const DEFAULT_DURATION_SECONDS = 20;
const DEFAULT_STORE_BASE_URL = 'http://localhost:3000';
const DEFAULT_ADMIN_BASE_URL = 'http://localhost:3001';
const LOAD_TEST_USER_EMAIL = process.env.LOAD_TEST_USER_EMAIL ?? 'loadtest+store@example.com';
const LOAD_TEST_USER_PASSWORD = process.env.LOAD_TEST_USER_PASSWORD ?? 'LoadTestPass123!';
const LOAD_TEST_SHIPPING_ADDRESS = {
	country: 'United States',
	region: 'California',
	city: 'San Francisco',
	postalCode: '94105',
	addressLine1: '201 Mission St',
	addressLine2: 'Suite 100',
} as const;

const prisma = new PrismaClient();

const parseCli = (): CliOptions => {
	const args = process.argv.slice(2);
	const getArgValue = (name: string) => {
		const prefixed = `${name}=`;
		const direct = args.find((arg) => arg.startsWith(prefixed));
		if (direct) return direct.slice(prefixed.length);
		const index = args.findIndex((arg) => arg === name);
		if (index >= 0 && args[index + 1]) return args[index + 1];
		return null;
	};

	const durationRaw = getArgValue('--duration') ?? `${DEFAULT_DURATION_SECONDS}`;
	const durationParsed = Number.parseInt(durationRaw, 10);
	const durationSeconds = Number.isFinite(durationParsed) && durationParsed > 0 ? durationParsed : DEFAULT_DURATION_SECONDS;

	return {
		storeBaseUrl: (getArgValue('--store-base-url') ?? DEFAULT_STORE_BASE_URL).replace(/\/+$/, ''),
		adminBaseUrl: (getArgValue('--admin-base-url') ?? DEFAULT_ADMIN_BASE_URL).replace(/\/+$/, ''),
		durationSeconds,
	};
};

const percentile = (values: number[], p: number) => {
	if (values.length === 0) return 0;
	if (values.length === 1) return values[0] ?? 0;
	const sorted = [...values].sort((a, b) => a - b);
	const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
	return sorted[rank] ?? 0;
};

const getSetCookieHeaders = (headers: Headers): string[] => {
	const maybeHeaders = headers as Headers & { getSetCookie?: () => string[] };
	if (typeof maybeHeaders.getSetCookie === 'function') {
		return maybeHeaders.getSetCookie();
	}
	const single = headers.get('set-cookie');
	return single ? [single] : [];
};

const parseCookieMap = (setCookieHeaders: string[]) => {
	const cookies = new Map<string, string>();
	for (const header of setCookieHeaders) {
		const firstPart = header.split(';')[0]?.trim();
		if (!firstPart) continue;
		const separator = firstPart.indexOf('=');
		if (separator <= 0) continue;
		const name = firstPart.slice(0, separator).trim();
		const value = firstPart.slice(separator + 1).trim();
		if (!name || !value) continue;
		cookies.set(name, value);
	}
	return cookies;
};

const serializeCookieMap = (cookies: Map<string, string>) =>
	Array.from(cookies.entries())
		.map(([name, value]) => `${name}=${value}`)
		.join('; ');

const makeSyntheticIp = (workerId: number, iteration: number, salt: number) => {
	const a = (salt % 200) + 20;
	const b = (workerId % 200) + 20;
	const c = (iteration % 200) + 20;
	return `10.${a}.${b}.${c}`;
};

const buildHeadersWithSyntheticIp = (
	workerId: number,
	iteration: number,
	baseHeaders?: Record<string, string>,
	salt = 17
) => {
	const ip = makeSyntheticIp(workerId, iteration, salt);
	return {
		...baseHeaders,
		'x-forwarded-for': ip,
		'x-real-ip': ip,
	};
};

const ensureStoreLoadTestUser = async () => {
	const existingUser = await prisma.user.findUnique({
		where: { email: LOAD_TEST_USER_EMAIL },
		select: { id: true },
	});

	const userId = existingUser?.id ?? `loadtest_${crypto.randomUUID().replace(/-/g, '')}`;
	if (!existingUser) {
		await prisma.user.create({
			data: {
				id: userId,
				name: 'Store Load Test User',
				email: LOAD_TEST_USER_EMAIL,
				emailVerified: true,
			},
		});
	} else {
		await prisma.user.update({
			where: { id: userId },
			data: { emailVerified: true },
		});
	}

	const passwordHash = await hashPassword(LOAD_TEST_USER_PASSWORD);
	const credentialAccount = await prisma.account.findFirst({
		where: {
			userId,
			providerId: 'credential',
		},
		select: { id: true },
	});

	if (credentialAccount) {
		await prisma.account.update({
			where: { id: credentialAccount.id },
			data: {
				accountId: LOAD_TEST_USER_EMAIL,
				password: passwordHash,
			},
		});
	} else {
		await prisma.account.create({
			data: {
				id: `acct_${crypto.randomUUID().replace(/-/g, '')}`,
				accountId: LOAD_TEST_USER_EMAIL,
				providerId: 'credential',
				userId,
				password: passwordHash,
			},
		});
	}
};

const loginStorefront = async (storeBaseUrl: string) => {
	const response = await fetch(`${storeBaseUrl}/api/auth/sign-in/email`, {
		method: 'POST',
		redirect: 'manual',
		headers: {
			'content-type': 'application/json',
			origin: storeBaseUrl,
		},
		body: JSON.stringify({
			email: LOAD_TEST_USER_EMAIL,
			password: LOAD_TEST_USER_PASSWORD,
			rememberMe: true,
		}),
	});

	const setCookie = getSetCookieHeaders(response.headers);
	const cookies = parseCookieMap(setCookie);
	if (!response.ok || cookies.size === 0) {
		const body = await response.text();
		throw new Error(`Storefront login failed (${response.status}): ${body.slice(0, 240)}`);
	}

	const cookieHeader = serializeCookieMap(cookies);
	const sessionProbe = await fetch(`${storeBaseUrl}/api/session/extended`, {
		headers: { cookie: cookieHeader },
	});
	if (!sessionProbe.ok) {
		throw new Error(`Session probe failed with status ${sessionProbe.status}`);
	}
	const sessionText = (await sessionProbe.text()).trim();
	if (!sessionText || sessionText === 'null') {
		throw new Error('Session probe returned null after storefront login');
	}

	return cookieHeader;
};

const loginAdmin = async (adminBaseUrl: string) => {
	const email = process.env.ADMINJS_EMAIL;
	const password = process.env.ADMINJS_PASSWORD;
	if (!email || !password) {
		throw new Error('ADMINJS_EMAIL and ADMINJS_PASSWORD are required for admin load tests');
	}

	const body = new URLSearchParams({ email, password });
	const response = await fetch(`${adminBaseUrl}/admin/login`, {
		method: 'POST',
		redirect: 'manual',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: body.toString(),
	});

	const cookies = parseCookieMap(getSetCookieHeaders(response.headers));
	if ((response.status < 300 || response.status >= 400) && !response.ok) {
		const raw = await response.text();
		throw new Error(`Admin login failed (${response.status}): ${raw.slice(0, 240)}`);
	}
	if (!cookies.has('adminjs')) {
		throw new Error('Admin login did not return adminjs session cookie');
	}
	return serializeCookieMap(cookies);
};

const getStripePayload = async (storeBaseUrl: string) => {
	const now = new Date();
	const publishedStatuses: ProductStatus[] = ['ACTIVE', 'DRAFT'];
	const variant = await prisma.productVariant.findFirst({
		where: {
			stock: { gt: 0 },
			product: {
				inStock: true,
				status: { in: publishedStatuses },
				OR: [
					{ publishStartAt: null, publishEndAt: null },
					{ publishStartAt: { lte: now }, publishEndAt: null },
					{ publishStartAt: null, publishEndAt: { gt: now } },
					{ publishStartAt: { lte: now }, publishEndAt: { gt: now } },
				],
			},
		},
		orderBy: [{ stock: 'desc' }, { createdAt: 'asc' }],
		select: { id: true, productId: true },
	});

	if (!variant) return null;
	return {
		items: [{ productId: variant.productId, variantId: variant.id, quantity: 1 }],
		locale: 'en',
		shippingAddress: LOAD_TEST_SHIPPING_ADDRESS,
		successUrl: `${storeBaseUrl}/en/checkout?status=success`,
		cancelUrl: `${storeBaseUrl}/en/checkout?status=cancel`,
	};
};

const runScenario = async (scenario: Scenario): Promise<ScenarioResult> => {
	const latencies: number[] = [];
	const statusCounts = new Map<number, number>();
	const errorSamples: string[] = [];
	let totalRequests = 0;
	let failedRequests = 0;

	const startedAt = performance.now();
	const endsAt = startedAt + scenario.durationMs;

	const workers = Array.from({ length: scenario.concurrency }, (_, workerId) =>
		(async () => {
			let iteration = 0;
			while (performance.now() < endsAt) {
				const request = scenario.makeRequest({ workerId, iteration });
				const begin = performance.now();
				try {
					const response = await fetch(request.url, {
						...request.init,
						redirect: request.init.redirect ?? 'manual',
					});
					const elapsed = performance.now() - begin;
					latencies.push(elapsed);
					totalRequests += 1;

					statusCounts.set(response.status, (statusCounts.get(response.status) ?? 0) + 1);
					const passedStatus = request.expectStatus(response.status);
					if (!passedStatus) {
						failedRequests += 1;
						if (errorSamples.length < 6) {
							errorSamples.push(`status_${response.status}`);
						}
					}
					await response.arrayBuffer();
				} catch (error) {
					const elapsed = performance.now() - begin;
					latencies.push(elapsed);
					totalRequests += 1;
					failedRequests += 1;
					if (errorSamples.length < 6) {
						const message = error instanceof Error ? error.message : String(error);
						errorSamples.push(`fetch_error:${message.slice(0, 160)}`);
					}
				}
				iteration += 1;
			}
		})()
	);

	await Promise.all(workers);
	const elapsedSeconds = Math.max(0.001, (performance.now() - startedAt) / 1000);
	const errorRatePct = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
	const p50Ms = percentile(latencies, 50);
	const p95Ms = percentile(latencies, 95);
	const p99Ms = percentile(latencies, 99);
	const maxMs = latencies.length > 0 ? Math.max(...latencies) : 0;
	const p95BudgetPass = p95Ms <= scenario.budget.p95Ms;
	const errorBudgetPass = errorRatePct <= scenario.budget.maxErrorRatePct;

	return {
		key: scenario.key,
		label: scenario.label,
		totalRequests,
		failedRequests,
		errorRatePct,
		rps: totalRequests / elapsedSeconds,
		p50Ms,
		p95Ms,
		p99Ms,
		maxMs,
		budget: scenario.budget,
		p95BudgetPass,
		errorBudgetPass,
		pass: p95BudgetPass && errorBudgetPass,
		statusCounts: Array.from(statusCounts.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([status, count]) => ({ status, count })),
		errorSamples,
	};
};

const formatStatusCounts = (statusCounts: Array<{ status: number; count: number }>) =>
	statusCounts.map((entry) => `${entry.status}:${entry.count}`).join(', ');

const printScenarioResult = (result: ScenarioResult) => {
	console.log(`\n[${result.key}] ${result.label}`);
	console.log(
		`requests=${result.totalRequests} failed=${result.failedRequests} errorRate=${result.errorRatePct.toFixed(2)}% rps=${result.rps.toFixed(2)}`
	);
	console.log(
		`latency_ms p50=${result.p50Ms.toFixed(1)} p95=${result.p95Ms.toFixed(1)} p99=${result.p99Ms.toFixed(1)} max=${result.maxMs.toFixed(1)}`
	);
	console.log(`status_counts ${formatStatusCounts(result.statusCounts) || 'none'}`);
	console.log(
		`budget p95<=${result.budget.p95Ms}ms:${result.p95BudgetPass ? 'PASS' : 'FAIL'} error<=${result.budget.maxErrorRatePct}%:${result.errorBudgetPass ? 'PASS' : 'FAIL'} overall:${result.pass ? 'PASS' : 'FAIL'}`
	);
	if (result.errorSamples.length > 0) {
		console.log(`errors ${result.errorSamples.join(' | ')}`);
	}
};

async function main() {
	const options = parseCli();
	const durationMs = options.durationSeconds * 1000;
	const storeOrigin = new URL(options.storeBaseUrl).origin;

	console.log('Preparing auth and test fixtures...');
	await ensureStoreLoadTestUser();

	const [storeCookie, adminCookie, stripePayload] = await Promise.all([
		loginStorefront(options.storeBaseUrl),
		loginAdmin(options.adminBaseUrl),
		getStripePayload(options.storeBaseUrl),
	]);

	const stripeProbe = await fetch(`${options.storeBaseUrl}/api/payments/stripe`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			origin: storeOrigin,
			cookie: storeCookie,
		},
		body: JSON.stringify(
			stripePayload ?? {
				items: [{ productId: 'missing', variantId: null, quantity: 1 }],
				locale: 'en',
				shippingAddress: LOAD_TEST_SHIPPING_ADDRESS,
				successUrl: `${options.storeBaseUrl}/en/checkout?status=success`,
				cancelUrl: `${options.storeBaseUrl}/en/checkout?status=cancel`,
			}
		),
	});
	const stripeProbeBody = await stripeProbe.text();
	const stripeSuccessPathAvailable = stripeProbe.status === 200;
	if (!stripeSuccessPathAvailable) {
		console.log(
			`Stripe success-path probe returned ${stripeProbe.status}; using guarded-path scenario. body=${stripeProbeBody.slice(0, 180)}`
		);
	}

	const scenarios: Scenario[] = [
		{
			key: 'catalog_home',
			label: 'Storefront catalog home page (/en)',
			durationMs,
			concurrency: 14,
			budget: { p95Ms: 400, maxErrorRatePct: 1 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.storeBaseUrl}/en`,
				init: {
					method: 'GET',
					headers: buildHeadersWithSyntheticIp(workerId, iteration, undefined, 11),
				},
				expectStatus: (status) => status === 200,
			}),
		},
		{
			key: 'catalog_search_page',
			label: 'Storefront search page (/en/products/search)',
			durationMs,
			concurrency: 12,
			budget: { p95Ms: 650, maxErrorRatePct: 1 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.storeBaseUrl}/en/products/search?searchQuery=zen&page=1&perPage=24`,
				init: {
					method: 'GET',
					headers: buildHeadersWithSyntheticIp(workerId, iteration, undefined, 23),
				},
				expectStatus: (status) => status === 200,
			}),
		},
		{
			key: 'catalog_search_api',
			label: 'Catalog search API (/api/products/search)',
			durationMs,
			concurrency: 20,
			budget: { p95Ms: 250, maxErrorRatePct: 1 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.storeBaseUrl}/api/products/search?q=ze&locale=en`,
				init: {
					method: 'GET',
					headers: buildHeadersWithSyntheticIp(workerId, iteration, undefined, 37),
				},
				expectStatus: (status) => status === 200,
			}),
		},
		{
			key: 'admin_dashboard_page',
			label: 'Admin dashboard page shell (/admin)',
			durationMs,
			concurrency: 8,
			budget: { p95Ms: 500, maxErrorRatePct: 1 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.adminBaseUrl}/admin`,
				init: {
					method: 'GET',
					headers: buildHeadersWithSyntheticIp(workerId, iteration, { cookie: adminCookie }, 41),
				},
				expectStatus: (status) => status === 200,
			}),
		},
		{
			key: 'admin_dashboard_api',
			label: 'Admin dashboard data API (/admin/api/dashboard)',
			durationMs,
			concurrency: 10,
			budget: { p95Ms: 300, maxErrorRatePct: 1 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.adminBaseUrl}/admin/api/dashboard`,
				init: {
					method: 'GET',
					headers: buildHeadersWithSyntheticIp(workerId, iteration, { cookie: adminCookie }, 53),
				},
				expectStatus: (status) => status === 200,
			}),
		},
	];

	if (stripeSuccessPathAvailable && stripePayload) {
		scenarios.push({
			key: 'stripe_checkout_session',
			label: 'Stripe checkout session creation (/api/payments/stripe, authenticated)',
			durationMs,
			concurrency: 8,
			budget: { p95Ms: 450, maxErrorRatePct: 2 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.storeBaseUrl}/api/payments/stripe`,
				init: {
					method: 'POST',
					headers: buildHeadersWithSyntheticIp(
						workerId,
						iteration,
						{
							'content-type': 'application/json',
							origin: storeOrigin,
							cookie: storeCookie,
						},
						71
					),
					body: JSON.stringify(stripePayload),
				},
				expectStatus: (status) => status === 200,
			}),
		});
	} else {
		scenarios.push({
			key: 'stripe_guard_path',
			label: 'Stripe route guard path (/api/payments/stripe, unauthenticated)',
			durationMs,
			concurrency: 10,
			budget: { p95Ms: 120, maxErrorRatePct: 0.5 },
			makeRequest: ({ workerId, iteration }) => ({
				url: `${options.storeBaseUrl}/api/payments/stripe`,
				init: {
					method: 'POST',
					headers: buildHeadersWithSyntheticIp(
						workerId,
						iteration,
						{
							'content-type': 'application/json',
							origin: storeOrigin,
						},
						83
					),
					body: JSON.stringify({
							items: [{ productId: 'missing', variantId: null, quantity: 1 }],
							locale: 'en',
							shippingAddress: LOAD_TEST_SHIPPING_ADDRESS,
							successUrl: `${options.storeBaseUrl}/en/checkout?status=success`,
							cancelUrl: `${options.storeBaseUrl}/en/checkout?status=cancel`,
						}),
				},
				expectStatus: (status) => status === 401,
			}),
		});
	}

	console.log(`Running ${scenarios.length} scenarios with duration=${options.durationSeconds}s...`);

	const results: ScenarioResult[] = [];
	for (const scenario of scenarios) {
		console.log(`\nRunning scenario ${scenario.key}...`);
		const result = await runScenario(scenario);
		printScenarioResult(result);
		results.push(result);
	}

	const failed = results.filter((result) => !result.pass);

	console.log('\n=== Load Test Summary ===');
	for (const result of results) {
		console.log(
			`${result.pass ? 'PASS' : 'FAIL'} ${result.key} p95=${result.p95Ms.toFixed(1)}ms error=${result.errorRatePct.toFixed(2)}%`
		);
	}

	if (failed.length > 0) {
		console.log(`\n${failed.length} scenario(s) failed budget checks.`);
		process.exitCode = 1;
	} else {
		console.log('\nAll scenarios met target p95/error budgets.');
		process.exitCode = 0;
	}
}

main()
	.catch((error) => {
		const message = error instanceof Error ? error.stack ?? error.message : String(error);
		console.error('\nLoad test failed:', message);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
