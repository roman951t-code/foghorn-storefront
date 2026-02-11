import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';
import { jsonNoStore } from '@/lib/response';

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const limitParam = url.searchParams.get('limit');
		const locale = url.searchParams.get('locale') || DEFAULT_LOCALE;
		const rawLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
		const limit =
			typeof rawLimit === 'number' && Number.isFinite(rawLimit)
				? Math.min(50, Math.max(1, rawLimit))
				: undefined;

		const session = await auth.api.getSession({ headers: await headers() });
		const userId = session?.user?.id;

		if (!userId) {
			return jsonNoStore({ products: [] }, { status: 200 });
		}

		const products = await getRecentlyViewedProducts(userId, limit, 0, locale);
		return jsonNoStore({ products }, { status: 200 });
	} catch (error) {
		return jsonNoStore({ products: [] }, { status: 500 });
	}
}
