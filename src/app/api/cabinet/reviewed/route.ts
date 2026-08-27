import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { jsonNoStore } from '@/lib/response';
import { getRecentlyViewedProductsWithCount } from '@/actions/products/getRecentlyViewedProducts';
import { resolveOffset, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import { DEFAULT_LOCALE, resolveAppLocale } from '@/constants/locales';

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return jsonNoStore({ items: [], totalCount: 0, currentPage: 1, pageSize: 1 }, { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;
	const page = resolvePageParam(searchParams.get('page') ?? undefined);
	const pageSize = resolvePerPageParam(searchParams.get('perPage') ?? undefined);
	const offset = resolveOffset(page, pageSize);
	const locale = resolveAppLocale(searchParams.get('locale') ?? DEFAULT_LOCALE);

	const { products, totalCount } = await getRecentlyViewedProductsWithCount(
		userId,
		pageSize,
		offset,
		locale,
	);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(page, totalPages);
	const normalizedOffset = resolveOffset(currentPage, pageSize);
	const normalizedItems =
		normalizedOffset === offset
			? products
			: (await getRecentlyViewedProductsWithCount(userId, pageSize, normalizedOffset, locale))
					.products;

	return jsonNoStore({ items: normalizedItems, totalCount, currentPage, pageSize });
}
