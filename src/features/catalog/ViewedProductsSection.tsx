import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import ProductsSection from './ProductsSection';
import { getRecentlyViewedProductsWithCount } from '@/actions/products/getRecentlyViewedProducts';

interface Props {
	title: string;
	tag?: string;
	limit?: number;
	locale?: string;
}

export default async function ViewedProductsSection({
	title,
	tag = 'viewed',
	limit,
	locale,
}: Props) {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	if (!userId) return null;

	const viewed = await getRecentlyViewedProductsWithCount(userId, limit, 0, locale);
	const inStockViewedProducts = viewed.products.filter((product) => Boolean(product?.inStock));
	if (!inStockViewedProducts.length) return null;

	return (
		<ProductsSection
			title={title}
			tag={tag}
			products={inStockViewedProducts}
			limit={limit}
			locale={locale}
		/>
	);
}
