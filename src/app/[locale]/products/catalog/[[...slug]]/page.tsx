import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Flex, Heading } from '@chakra-ui/react';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import CategorySlider from '@/components/pages/products/CategorySlider';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'catalog');
}

export default function Category() {
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs />
			<Heading as='h1' size='3xl' fontWeight='medium'>
				Меблі та техніка
			</Heading>
			<CategorySlider />
			<Heading as='h1' size='3xl' fontWeight='medium'>
				Спорт товари
			</Heading>
			<CategorySlider />
		</Flex>
	);
}
