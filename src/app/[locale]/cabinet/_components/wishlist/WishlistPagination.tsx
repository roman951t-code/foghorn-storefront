'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWishList } from '@/hooks/useWishList';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';

type Props = {
	currentPage: number;
	pageSize?: number;
	baseRoute?: string;
};

export default function WishlistPagination({
	currentPage,
	pageSize = PRODUCTS_PER_PAGE,
	baseRoute = '/cabinet/wishlist',
}: Props) {
	const router = useRouter();
	const { ids: wishListIds } = useWishList();
	const totalItems = wishListIds?.length ?? 0;
	const safePageSize = Math.max(1, Math.floor(pageSize || 1));
	const totalPages = Math.max(1, Math.ceil(Math.max(totalItems, 0) / safePageSize));
	const safePage = Math.min(Math.max(1, currentPage), totalPages);

	useEffect(() => {
		if (!totalItems) return;
		if (safePage === currentPage) return;

		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', safePage.toString());
		searchParams.set('perPage', safePageSize.toString());
		router.replace(`${window.location.pathname}?${searchParams.toString()}`);
	}, [currentPage, router, safePage, safePageSize, totalItems]);

	return (
		<Pagination
			currentPage={safePage}
			totalItems={totalItems}
			pageSize={safePageSize}
			baseRoute={baseRoute}
		/>
	);
}
