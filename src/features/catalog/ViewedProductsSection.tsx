import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import ProductsSection from './ProductsSection';
import { getRecentlyViewedProductsWithCount } from '@/actions/products/getRecentlyViewedProducts';

interface Props {
	title: string;
	tag?: string;
	limit?: number;
}

export default async function ViewedProductsSection({ title, tag = 'viewed', limit }: Props) {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	if (!userId) return null;

	const viewed = await getRecentlyViewedProductsWithCount(userId, limit, 0);
	if (!viewed.products.length) return null;

	return <ProductsSection title={title} tag={tag} products={viewed.products} limit={limit} />;
}
