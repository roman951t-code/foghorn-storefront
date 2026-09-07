import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getProductSearchSuggestions } from '@/actions/products/getProductSearchSuggestions';

export async function GET(req: Request) {
	const ip = getClientIp(req);
	const rate = await checkRateLimit({ key: `api:search:${ip}`, limit: 60, windowMs: 60_000 });
	if (!rate.allowed) {
		return NextResponse.json(
			{ products: [], subcategories: [], error: 'rate_limited' },
			{
				status: 429,
				headers: { 'Retry-After': String(rate.retryAfterSeconds) },
			},
		);
	}

	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q')?.trim().slice(0, 64);
	const locale = searchParams.get('locale')?.trim().toLowerCase() || DEFAULT_LOCALE;

	if (!query || query.length < 2) {
		return NextResponse.json({ products: [], subcategories: [] });
	}

	const { products, subcategories } = await getProductSearchSuggestions(query, locale);
	return NextResponse.json({ products, subcategories });
}
