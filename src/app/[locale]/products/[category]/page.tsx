import type { Metadata } from 'next';
import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Heading, Stack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import CategorySlider from '@/components/pages/products/CategorySlider';
import { notFound } from 'next/navigation';

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

	const t = await getTranslations('Metadata');
	const title = t('category', { category: category.name });

	return {
		title,
		description: '',
	};
}

export default async function CategoryPage({ params }: Params) {
	const { category: categorySlug } = await params;

	const categories = await prisma.productCategory.findMany({
		where: { parentId: null },
		include: {
			children: {
				select: {
					id: true,
					name: true,
					slug: true,
					products: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
						orderBy: { name: 'asc' },
						take: 5,
					},
				},
			},
		},
		orderBy: { name: 'asc' },
	});

	const category = categories.find((cat) => cat.slug === categorySlug);

	if (!category) notFound();

	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column' mb='6'>
			<Breadcrumbs categoryName={category?.name} categorySlug={category?.slug} />

			<Stack gap='6'>
				<Heading as='h1' size='3xl' fontWeight='medium'>
					{category.name}
				</Heading>

				<CategorySlider category={category} />
			</Stack>
		</Stack>
	);
}
