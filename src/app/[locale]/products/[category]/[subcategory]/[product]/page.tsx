import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Flex } from '@chakra-ui/react';
import ProductTabs from '@/features/product/ProductTabs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getProductBySlug } from '@/actions/products/getProductBySlug';
import { notFound } from 'next/navigation';
import { getProductNameBySlug } from '@/actions/products/getProductNameBySlug';

type Props = {
	params: { category: string; subcategory: string; product: string };
	searchParams: { tab?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { product: productSlug } = await params;

	const productData = await getProductNameBySlug(productSlug);
	if (!productData) notFound();

	const t = await getTranslations('pages');
	const title = t('metadata.product', { product: productData.name });

	return {
		title,
		description: '',
	};
}

export default async function ProductDetail({ params, searchParams }: Props) {
	const { category, subcategory, product } = await params;
	const { tab } = await searchParams;

	const productData = await getProductBySlug(product);

	if (!productData) notFound();

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
			<Breadcrumbs
				categorySlug={category}
				subcategorySlug={subcategory}
				categoryName={productData?.categoryName}
				subcategoryName={productData?.subcategoryName}
				productSlug={productData?.slug}
				productName={productData?.name}
			/>

			<ProductTabs tab={tab} product={productData} category={category} subcategory={subcategory} />
		</Flex>
	);
}
