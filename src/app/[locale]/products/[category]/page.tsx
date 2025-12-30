import type { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Heading, Stack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getCategoryData } from '@/actions/products/getCategoryData';
import CategoryCards from './_components/CategoryCards';
import { absoluteUrl, buildLanguageAlternates, localizePath } from '@/utils/seo';
import Script from 'next/script';
import { CategoryParams } from '@/types/routing';
import { ensureParams } from '@/utils/validateParams';
import { categoryParamsSchema } from 'validationSchemas/productParamsSchemas';

export async function generateMetadata({ params }: CategoryParams): Promise<Metadata> {
	const { category: categorySlug, locale } = ensureParams(categoryParamsSchema, await params);

	const category = await prisma.productCategory.findUnique({
		where: { slug: categorySlug },
		select: { name: true, imageUrl: true },
	});

	if (!category) {
		notFound();
	}

	const pagesT = await getTranslations('pages');
	const title = pagesT('metadata.category', { category: category.name });
	const description = pagesT('metadata.categoryDescription', { category: category.name });
	const imageUrl = category.imageUrl
		? absoluteUrl(category.imageUrl.startsWith('http') ? category.imageUrl : category.imageUrl)
		: absoluteUrl('/assets/images/logoBig.webp');

	return {
		title,
		description,
		alternates: buildLanguageAlternates(locale, `/products/${categorySlug}`),
		openGraph: {
			title,
			description,
			type: 'website',
			url: absoluteUrl(localizePath(locale, `/products/${categorySlug}`)),
			images: [imageUrl],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl],
		},
	};
}

export const revalidate = 120;

export default async function CategoryPage({ params }: CategoryParams) {
	const { category: categorySlug, locale } = ensureParams(categoryParamsSchema, await params);
	const categoryDataResponse = await getCategoryData();

	const category = categoryDataResponse.categoryData.find((cat) => cat.slug === categorySlug);

	if (!category) notFound();

	const breadcrumbsJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: absoluteUrl(localizePath(locale, '/')),
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: category.name,
				item: absoluteUrl(localizePath(locale, `/products/${category.slug}`)),
			},
		],
	};

	return (
		<>
			<Script id='category-breadcrumbs-schema' type='application/ld+json'>
				{JSON.stringify(breadcrumbsJsonLd)}
			</Script>
			<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column'>
				<Breadcrumbs categoryName={category?.name} categorySlug={category?.slug} />

				<Stack gapY='8'>
					<Heading as='h1' size='3xl' fontWeight='medium'>
						{category.name}
					</Heading>

					<CategoryCards category={category} />
				</Stack>
			</Stack>
		</>
	);
}
