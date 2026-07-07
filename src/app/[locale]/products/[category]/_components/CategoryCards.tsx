import CategoryCard from '@/features/product/cards/CategoryCard';
import type { CatalogCategory } from '@/types/product';
import { Wrap } from '@chakra-ui/react';
import { resolveSubcategoryImage } from '@/utils/categoryImages';
import { getTranslations } from 'next-intl/server';

export default async function CategoryCards({
	category,
	locale,
}: {
	category: CatalogCategory;
	locale: string;
}) {
	const productsT = await getTranslations({ locale, namespace: 'products' });
	const seeProductsLabel = productsT('seeProducts');

	return (
		<Wrap gapX='4' gapY='8'>
			{category?.children.map((sub) => (
				<CategoryCard
					key={sub.id}
					title={sub.name}
					imageUrl={resolveSubcategoryImage(sub.imageUrl, sub.products[0]?.imageUrl)}
					products={sub.products.map((product) => ({
						name: product.name,
						href: `/products/${product.fullSlug}`,
					}))}
					viewAllHref={`/products/${category.slug}/${sub.slug}`}
					seeProductsLabel={seeProductsLabel}
				/>
			))}
		</Wrap>
	);
}
