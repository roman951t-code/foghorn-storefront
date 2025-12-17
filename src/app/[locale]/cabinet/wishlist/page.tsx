import { VStack } from '@chakra-ui/react';
import WishList from '../_components/wishlist/WishList';
import WishlistPagination from '../_components/wishlist/WishlistPagination';
import CabinetSectionHeading from '@/components/ui/CabinetSectionHeading';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getTranslations } from 'next-intl/server';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Wishlist({ searchParams }: Props) {
	const [navT, prodT, genT, wishT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('products'),
		getTranslations('common'),
		getTranslations('wishlist'),
	]);

	const params = await searchParams;
	const requestedPage = Number.parseInt(params?.page ?? '1', 10);
	const requestedPerPage = Number.parseInt(params?.perPage ?? `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize =
		Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const currentPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

	const sortI18n = {
		new: prodT('new'),
		expensiveToCheap: prodT('expensiveToCheap'),
		cheapToExpensive: prodT('cheapToExpensive'),
	};
	const shareCopiedText = wishT('shareCopied');

	return (
		<VStack>
			<CabinetSectionHeading title={navT('sidebar.wishList')} />
			<WishList
				emptyText={wishT('wishListEmpty')}
				currentPage={currentPage}
				pageSize={pageSize}
				totalProductsText={prodT('totalProducts')}
				unitsText={genT('units')}
				shareCopiedText={shareCopiedText}
				sortI18n={sortI18n}
			/>
			<WishlistPagination currentPage={currentPage} pageSize={pageSize} />
		</VStack>
	);
}
