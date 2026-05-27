import WishList from '../_components/wishlist/WishList';
import WishlistPagination from '../_components/wishlist/WishlistPagination';
import { PRODUCTS_PER_PAGE, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import { getTranslations } from 'next-intl/server';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Wishlist({ searchParams }: Props) {
	const [prodT, genT, wishT] = await Promise.all([
		getTranslations('products'),
		getTranslations('common'),
		getTranslations('wishlist'),
	]);

	const params = await searchParams;
	const currentPage = resolvePageParam(params?.page ?? '1');
	const pageSize = resolvePerPageParam(params?.perPage ?? `${PRODUCTS_PER_PAGE}`);

	const sortI18n = {
		new: prodT('new'),
		expensiveToCheap: prodT('expensiveToCheap'),
		cheapToExpensive: prodT('cheapToExpensive'),
	};
	const shareCopiedText = wishT('shareCopied');

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width: '100%',
				marginTop: '16px',
			}}
		>
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
		</div>
	);
}
