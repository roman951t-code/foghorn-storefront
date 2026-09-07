import { NextRequest } from 'next/server';
import { jsonNoStore } from '@/lib/response';
import { getUserReviewedProducts } from '@/actions/feedback/getUserReviewedProducts';
import { resolveOffset, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const page = resolvePageParam(searchParams.get('page') ?? undefined);
	const pageSize = resolvePerPageParam(searchParams.get('perPage') ?? undefined);
	const offset = resolveOffset(page, pageSize);

	const { items, totalCount } = await getUserReviewedProducts(pageSize, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(page, totalPages);
	const normalizedOffset = resolveOffset(currentPage, pageSize);
	const normalizedItems =
		normalizedOffset === offset
			? items
			: (await getUserReviewedProducts(pageSize, normalizedOffset)).items;

	return jsonNoStore({ items: normalizedItems, totalCount, currentPage, pageSize });
}
