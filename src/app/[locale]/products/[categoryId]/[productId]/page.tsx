import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { useTranslations } from 'next-intl';
import { Flex } from '@chakra-ui/react';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import ProductTabs from '@/components/product/ProductTabs';

interface Props {
	params: { category: string; subcategory: string; productId: string };
}

export const metadata = {
	openGraph: {
		images: ['/ua/products/123/888/opengraph-image'],
	},
};

export default function ProductDetail({ params }: Props) {
	const { category, subcategory = 'Технika' } = params;

	const t = useTranslations('Products');
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
			<Breadcrumbs category={category} subcategory={subcategory} />
			<ProductTabs />
			<ProductsSection title={t('similar')} mb='0' />
			<SubscribeSection />
		</Flex>
	);
}
