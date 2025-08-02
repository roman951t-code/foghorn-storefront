import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Flex } from '@chakra-ui/react';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import ProductTabs from '@/components/product/ProductTabs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getProductBySlug } from '@/actions/products/getProductBySlug';

type Props = {
	params: { category: string; subcategory: string; product: string };
	searchParams: { tab?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { product } = await params;

	const t = await getTranslations('Metadata');
	const title = t('product', { product });

	return {
		title,
		description: '',
	};
}

// export const metadata = {
// 	openGraph: {
// 		images: ['/ua/products/123/888/opengraph-image'],
// 	},
// };

export default async function ProductDetail({ params, searchParams }: Props) {
	const { category, subcategory, product } = await params;
	const { tab } = await searchParams;

	const currentProduct = await getProductBySlug(product);

	const t = await getTranslations('Products');

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
			<Breadcrumbs category={category} subcategory={subcategory} product={product} />
			<ProductTabs tab={tab} product={currentProduct} />
			<ProductsSection title={t('similar')} mb='0' />
			<SubscribeSection />
		</Flex>
	);
}
