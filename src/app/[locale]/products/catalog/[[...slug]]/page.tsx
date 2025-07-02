import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Heading, Stack } from '@chakra-ui/react';
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
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column' mb='6'>
			<Breadcrumbs />

			<Stack gap='6'>
				<Heading as='h1' size='3xl' fontWeight='medium'>
					Меблі та техніка
				</Heading>
				<CategorySlider />
			</Stack>

			<Stack gap='6'>
				<Heading as='h1' size='3xl' fontWeight='medium'>
					Спорт товари
				</Heading>
				<CategorySlider />
			</Stack>

			<Stack gap='6'>
				<Heading as='h1' size='3xl' fontWeight='medium'>
					Меблі та техніка
				</Heading>
				<CategorySlider />
			</Stack>
		</Stack>
	);
}
