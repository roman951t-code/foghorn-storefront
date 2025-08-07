import type { Metadata } from 'next';
import CategoryClient from '@/components/pages/products/CategoryClient';
import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Stack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';

type Params = {
	params: { locale: string; category: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { category } = params;

	const t = await getTranslations('Metadata');
	const title = t('category', { category });

	return {
		title,
		description: '',
	};
}

export default async function CategoryPage({ params }: Params) {
	const { category } = await params;

	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column' mb='6'>
			<Breadcrumbs />
			<CategoryClient slug={category} />
		</Stack>
	);
}
