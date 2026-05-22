import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_REPORTS_PER_MINUTE_PER_IP = 120;
const REPORT_WINDOW_MS = 60_000;

type CspReportEnvelope = {
	'csp-report'?: {
		'blocked-uri'?: string;
		'document-uri'?: string;
		'effective-directive'?: string;
		'violated-directive'?: string;
		'original-policy'?: string;
		referrer?: string;
		'status-code'?: number;
		[source: string]: unknown;
	};
};

type ReportingApiItem = {
	type?: string;
	url?: string;
	body?: {
		blockedURL?: string;
		effectiveDirective?: string;
		violatedDirective?: string;
		originalPolicy?: string;
		statusCode?: number;
		[source: string]: unknown;
	};
	[source: string]: unknown;
};

export async function POST(req: NextRequest) {
	const ip = getClientIp(req);
	const rate = await checkRateLimit({
		key: `security:csp-report:${ip}`,
		limit: MAX_REPORTS_PER_MINUTE_PER_IP,
		windowMs: REPORT_WINDOW_MS,
	});

	if (!rate.allowed) {
		const status = rate.statusCode ?? 429;
		return NextResponse.json(
			{ error: status === 503 ? 'service_unavailable' : 'rate_limited' },
			{
				status,
				headers: {
					'Retry-After': String(rate.retryAfterSeconds),
					'Cache-Control': 'no-store',
				},
			},
		);
	}

	const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';
	const body = await req.json().catch(() => null);

	if (!body) {
		return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
	}

	const createdAt = new Date().toISOString();

	if (Array.isArray(body) && contentType.includes('application/reports+json')) {
		const reports = (body as ReportingApiItem[]).slice(0, 20);
		console.warn('CSP report (Reporting API)', {
			createdAt,
			count: reports.length,
			sample: reports.map((item) => ({
				type: item.type ?? null,
				url: item.url ?? null,
				effectiveDirective: item.body?.effectiveDirective ?? null,
				violatedDirective: item.body?.violatedDirective ?? null,
				blockedURL: item.body?.blockedURL ?? null,
				statusCode: item.body?.statusCode ?? null,
			})),
		});
		return new NextResponse(null, { status: 204 });
	}

	const legacy = body as CspReportEnvelope;
	const report = legacy['csp-report'];
	if (!report) {
		return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
	}

	console.warn('CSP report (legacy)', {
		createdAt,
		documentUri: report['document-uri'] ?? null,
		effectiveDirective: report['effective-directive'] ?? null,
		violatedDirective: report['violated-directive'] ?? null,
		blockedUri: report['blocked-uri'] ?? null,
		statusCode: report['status-code'] ?? null,
	});

	return new NextResponse(null, { status: 204 });
}
