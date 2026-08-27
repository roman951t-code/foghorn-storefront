import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { includesTimingSafeSecret } from '@/lib/timingSafeSecret';
import { computeProductEffectivePrice } from '@/utils/productEffectivePrice';
import {
	PRODUCT_CATALOG_CACHE_TAG,
	PRODUCT_CATEGORY_CACHE_TAG,
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_FILTERS_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

export const maxDuration = 60;

const PAGE_CACHE_TAG = 'pages';
const PROMO_CACHE_TAG = 'promo-cards';
const DEFAULT_LOOKBACK_SECONDS = 180;
const MAX_LOOKBACK_SECONDS = 3600;
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 2000;
const MAX_ALERT_BODY_LENGTH = 1000;
const REVALIDATE_SECRET_PATTERN = /^[A-Za-z0-9._~-]{24,256}$/;

const parseIntegerInRange = (
	raw: string | null,
	defaultValue: number,
	minValue: number,
	maxValue: number,
) => {
	if (!raw) return defaultValue;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return defaultValue;
	return Math.min(maxValue, Math.max(minValue, parsed));
};

const truncate = (value: string, limit: number) =>
	value.length > limit ? `${value.slice(0, Math.max(0, limit - 3))}...` : value;

const toErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message;
	return String(error);
};

const normalizeSecret = (value: string | null) => {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const resolveProvidedRevalidateSecret = (req: Request) => {
	const fromHeader = normalizeSecret(req.headers.get('x-revalidate-secret'));
	if (fromHeader) return fromHeader;

	const authorization = normalizeSecret(req.headers.get('authorization'));
	if (!authorization) return null;
	const match = authorization.match(/^Bearer\s+(.+)$/i);
	if (!match) return null;
	return normalizeSecret(match[1] ?? null);
};

const resolveExpectedRevalidateSecrets = () =>
	Array.from(
		new Set(
			[env.CACHE_REVALIDATE_SECRET, env.CRON_SECRET]
				.map((value) => normalizeSecret(value ?? null))
				.filter((value): value is string => Boolean(value)),
		),
	);

const logWindowEvent = (
	level: 'info' | 'warn' | 'error',
	event: string,
	payload: Record<string, unknown>,
) => {
	const entry = {
		source: 'api-cache-revalidate-windows',
		event,
		level,
		timestamp: new Date().toISOString(),
		...payload,
	};
	if (level === 'error') {
		console.error(entry);
		return;
	}
	if (level === 'warn') {
		console.warn(entry);
		return;
	}
	console.info(entry);
};

const sendWindowAlert = async (event: string, payload: Record<string, unknown>) => {
	if (!env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL) return;
	try {
		const response = await fetch(env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				source: 'api-cache-revalidate-windows',
				event,
				severity: 'error',
				timestamp: new Date().toISOString(),
				payload,
			}),
		});
		if (!response.ok) {
			const body = await response.text().catch(() => '');
			logWindowEvent('warn', 'alert-webhook-non-ok', {
				status: response.status,
				body: truncate(body, MAX_ALERT_BODY_LENGTH),
			});
		}
	} catch (error) {
		logWindowEvent('warn', 'alert-webhook-failed', {
			error: toErrorMessage(error),
		});
	}
};

const isBoundaryWithinWindow = (dateValue: Date | null, from: Date, to: Date) => {
	if (!dateValue) return false;
	const ts = dateValue.getTime();
	return ts > from.getTime() && ts <= to.getTime();
};

const handleWindowRevalidation = async (req: Request) => {
	const startedAt = Date.now();
	const requestId = crypto.randomUUID();

	const expectedSecrets = resolveExpectedRevalidateSecrets();
	if (expectedSecrets.length === 0) {
		logWindowEvent('error', 'revalidate-not-configured', { requestId });
		return NextResponse.json({ error: 'cache-revalidate-not-configured' }, { status: 503 });
	}

	const providedSecret = resolveProvidedRevalidateSecret(req);
	const hasValidSecretFormat =
		typeof providedSecret === 'string' && REVALIDATE_SECRET_PATTERN.test(providedSecret);
	if (!hasValidSecretFormat || !includesTimingSafeSecret(expectedSecrets, providedSecret)) {
		logWindowEvent('warn', 'revalidate-unauthorized', { requestId });
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
	}

	const url = new URL(req.url);
	const lookbackSeconds = parseIntegerInRange(
		url.searchParams.get('lookbackSeconds'),
		DEFAULT_LOOKBACK_SECONDS,
		30,
		MAX_LOOKBACK_SECONDS,
	);
	const limit = parseIntegerInRange(url.searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT);
	const dryRun = url.searchParams.get('dryRun') === 'true';

	const now = new Date();
	const from = new Date(now.getTime() - lookbackSeconds * 1000);

	try {
		const [products, banners, pages] = await Promise.all([
			prisma.product.findMany({
				where: {
					OR: [
						{ discountStartAt: { gt: from, lte: now } },
						{ discountEndAt: { gt: from, lte: now } },
						{ publishStartAt: { gt: from, lte: now } },
						{ publishEndAt: { gt: from, lte: now } },
					],
				},
				select: {
					id: true,
					basePrice: true,
					discountPrice: true,
					discountStartAt: true,
					discountEndAt: true,
					publishStartAt: true,
					publishEndAt: true,
					updatedAt: true,
					variants: {
						where: { stock: { gt: 0 } },
						orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
						take: 1,
						select: {
							price: true,
							discountPrice: true,
							discountStartAt: true,
							discountEndAt: true,
						},
					},
				},
				orderBy: { updatedAt: 'desc' },
				take: limit,
			}),
			prisma.banner.findMany({
				where: {
					isActive: true,
					OR: [{ startsAt: { gt: from, lte: now } }, { endsAt: { gt: from, lte: now } }],
				},
				select: {
					id: true,
					startsAt: true,
					endsAt: true,
					updatedAt: true,
				},
				orderBy: { updatedAt: 'desc' },
				take: limit,
			}),
			prisma.page.findMany({
				where: {
					status: 'PUBLISHED',
					publishedAt: { gt: from, lte: now },
				},
				select: {
					slug: true,
					publishedAt: true,
					updatedAt: true,
				},
				orderBy: { updatedAt: 'desc' },
				take: limit,
			}),
		]);

		const boundarySummary = {
			products: {
				discountStart: products.filter((product) =>
					isBoundaryWithinWindow(product.discountStartAt, from, now),
				).length,
				discountEnd: products.filter((product) =>
					isBoundaryWithinWindow(product.discountEndAt, from, now),
				).length,
				publishStart: products.filter((product) =>
					isBoundaryWithinWindow(product.publishStartAt, from, now),
				).length,
				publishEnd: products.filter((product) =>
					isBoundaryWithinWindow(product.publishEndAt, from, now),
				).length,
			},
			banners: {
				start: banners.filter((banner) => isBoundaryWithinWindow(banner.startsAt, from, now))
					.length,
				end: banners.filter((banner) => isBoundaryWithinWindow(banner.endsAt, from, now)).length,
			},
			pages: {
				publish: pages.filter((page) => isBoundaryWithinWindow(page.publishedAt, from, now)).length,
			},
		};

		const productIds = products.map((product) => product.id);
		const pageSlugs = pages.map((page) => page.slug);
		const tags = Array.from(
			new Set([
				PRODUCT_LIST_CACHE_TAG,
				PRODUCT_DETAIL_CACHE_TAG,
				PRODUCT_CATEGORY_CACHE_TAG,
				PRODUCT_FILTERS_CACHE_TAG,
				PRODUCT_CATALOG_CACHE_TAG,
				...(banners.length > 0 ? [PROMO_CACHE_TAG] : []),
				...(pages.length > 0 ? [PAGE_CACHE_TAG, ...pageSlugs.map((slug) => `page:${slug}`)] : []),
				...productIds.map((productId) => productCacheTagById(productId)),
			]),
		);

		const truncation = {
			products: products.length === limit,
			banners: banners.length === limit,
			pages: pages.length === limit,
		};
		const isTruncated = truncation.products || truncation.banners || truncation.pages;
		if (isTruncated) {
			const details = {
				requestId,
				limit,
				lookbackSeconds,
				productCount: products.length,
				bannerCount: banners.length,
				pageCount: pages.length,
				tagCount: tags.length,
				truncation,
			};
			logWindowEvent('warn', 'window-revalidation-truncated', details);
			await sendWindowAlert('window-revalidation-truncated', details);
		}

		if (!dryRun && tags.length > 0) {
			await Promise.all(tags.map((tag) => revalidateTag(tag, 'default')));
		}

		// These are exactly the products whose discount/publish window crossed
		// a boundary with no other write to trigger a recompute — the one case
		// src/utils/productEffectivePrice.ts's other callers (admin mutations,
		// order stock changes) can't catch on their own. Isolated in its own
		// try/catch: a failure here must never turn this cron's actual job
		// (cache revalidation, already done above) into a reported failure.
		if (!dryRun && products.length > 0) {
			try {
				await Promise.all(
					products.map((product) => {
						const sortPrice = computeProductEffectivePrice({
							basePrice: product.basePrice,
							discountPrice: product.discountPrice,
							discountStartAt: product.discountStartAt,
							discountEndAt: product.discountEndAt,
							defaultVariant: product.variants[0] ?? null,
							now,
						});
						return prisma.product.update({
							where: { id: product.id },
							data: { sortPrice: new Prisma.Decimal(sortPrice.toFixed(2)) },
						});
					}),
				);
			} catch (error) {
				logWindowEvent('warn', 'sort-price-recalculation-failed', {
					requestId,
					error: toErrorMessage(error),
				});
			}
		}

		logWindowEvent('info', 'window-revalidation-success', {
			requestId,
			lookbackSeconds,
			limit,
			dryRun,
			productCount: products.length,
			bannerCount: banners.length,
			pageCount: pages.length,
			tagCount: tags.length,
			boundarySummary,
			durationMs: Date.now() - startedAt,
		});

		return NextResponse.json({
			ok: true,
			requestId,
			dryRun,
			lookbackSeconds,
			limit,
			windowStart: from.toISOString(),
			windowEnd: now.toISOString(),
			productCount: products.length,
			bannerCount: banners.length,
			pageCount: pages.length,
			tagCount: tags.length,
			truncated: isTruncated,
			truncation,
			boundarySummary,
			productIdsSample: productIds.slice(0, 100),
			pageSlugsSample: pageSlugs.slice(0, 100),
		});
	} catch (error) {
		const details = {
			requestId,
			lookbackSeconds,
			limit,
			error: toErrorMessage(error),
			durationMs: Date.now() - startedAt,
		};
		logWindowEvent('error', 'window-revalidation-failed', details);
		await sendWindowAlert('window-revalidation-failed', details);
		return NextResponse.json({ error: 'window-revalidation-failed', requestId }, { status: 500 });
	}
};

export async function POST(req: Request) {
	return handleWindowRevalidation(req);
}

export async function GET(req: Request) {
	return handleWindowRevalidation(req);
}
