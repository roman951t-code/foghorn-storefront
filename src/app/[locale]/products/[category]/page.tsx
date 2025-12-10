import type { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Heading, Stack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getCategoryData } from '@/actions/products/getCategoryData';
import CategoryCards from './_components/CategoryCards';

type Params = {
	params: { locale: string; category: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { category: categorySlug } = await params;

	const category = await prisma.productCategory.findUnique({
		where: { slug: categorySlug },
		select: { name: true },
	});

	if (!category) {
		notFound();
	}

	const t = await getTranslations('pages');
	const title = t('metadata.category', { category: category.name });

	return {
		title,
		description: '',
	};
}

export default async function CategoryPage({ params }: Params) {
	const { category: categorySlug } = await params;
	const categoryDataResponse = await getCategoryData();

	const category = categoryDataResponse.categoryData.find((cat) => cat.slug === categorySlug);

	if (!category) notFound();

	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column'>
			<Breadcrumbs categoryName={category?.name} categorySlug={category?.slug} />

			<Stack gapY='8'>
				<Heading as='h1' size='3xl' fontWeight='medium'>
					{category.name}
				</Heading>

				<CategoryCards category={category} />
			</Stack>
		</Stack>
	);
}
