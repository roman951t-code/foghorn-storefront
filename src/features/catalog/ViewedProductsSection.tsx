import ProductsSection from './ProductsSection';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';

interface Props {
	title: string;
	tag?: string;
}

export default async function ViewedProductsSection({ title, tag }: Props) {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return null;

	const products = await getRecentlyViewedProducts(userId);
	if (!products.length) return null;

	return <ProductsSection title={title} tag={tag} products={products} />;
}
