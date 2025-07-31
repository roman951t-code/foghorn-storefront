import CategoryClient from '@/components/pages/products/CategoryClient';
import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Stack } from '@chakra-ui/react';

type Params = {
	params: { locale: string; slug: string };
};

export default async function CategoryPage({ params }: Params) {
	const { slug } = await params;

	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column' mb='6'>
			<Breadcrumbs />
			<CategoryClient slug={slug} />
		</Stack>
	);
}
