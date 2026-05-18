import type { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Heading, Stack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/actions/products/getCategoryBySlug';
import CategoryCards from './_components/CategoryCards';
import { absoluteUrl, buildLanguageAlternates, localizePath } from '@/utils/seo';
import Script from 'next/script';
import { CategoryParams } from '@/types/routing';
import { ensureParams } from '@/utils/validateParams';
import { categoryParamsSchema } from 'validationSchemas/productParamsSchemas';
import { headers } from 'next/headers';
import { CATEGORY_PLACEHOLDER_IMAGE } from '@/utils/categoryImages';

export async function generateMetadata({ params }: CategoryParams): Promise<Metadata> {
	const { category: categorySlug, locale } = ensureParams(categoryParamsSchema, await params);
	const category = await getCategoryBySlug(categorySlug, locale);

	if (!category) {
		notFound();
	}
	const categoryName = category.name;

	const pagesT = await getTranslations('pages');
	const title = pagesT('metadata.category', { category: categoryName });
	const description = pagesT('metadata.categoryDescription', { category: categoryName });
	const categoryImage =
		typeof category.imageUrl === 'string' && category.imageUrl.trim().length > 0
			? category.imageUrl
			: CATEGORY_PLACEHOLDER_IMAGE;
	const imageUrl = absoluteUrl(categoryImage);

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

export default async function CategoryPage({ params }: CategoryParams) {
	const { category: categorySlug, locale } = ensureParams(categoryParamsSchema, await params);
	const headersList = await headers();
	const cspNonce = headersList.get('x-csp-nonce') ?? undefined;
	const category = await getCategoryBySlug(categorySlug, locale);

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
			<Script id='category-breadcrumbs-schema' nonce={cspNonce} type='application/ld+json'>
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
