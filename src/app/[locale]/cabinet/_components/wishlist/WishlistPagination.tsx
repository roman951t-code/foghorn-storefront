'use client';
import { useWishList } from '@/hooks/useWishList';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';

export default function WishlistPagination() {
	const page = parseInt('1', 10);
	const { ids: wishListIds } = useWishList();

	return (
		<Pagination
			currentPage={page}
			totalProductsCount={wishListIds?.length || 0}
			productsPerPage={PRODUCTS_PER_PAGE}
			baseRoute='/cabinet/wishlist'
		/>
	);
}
