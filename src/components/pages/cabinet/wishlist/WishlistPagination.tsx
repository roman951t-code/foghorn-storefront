'use client';
import { useWishList } from '@/components/providers/WishListProvider';
import Pagination from '@/components/reusable/Pagination';

const PRODUCTS_PER_PAGE = 4;

export default function WishlistPagination() {
	const page = parseInt('1', 10);
	const { ids: wishListIds } = useWishList();

	return (
		<Pagination
			currentPage={page}
			totalProductsCount={wishListIds?.length || 0}
			productsPerPage={PRODUCTS_PER_PAGE}
			baseRoute={'cabinet/wishlist'}
		/>
	);
}
