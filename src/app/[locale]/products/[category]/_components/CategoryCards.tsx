'use client';

import dynamic from 'next/dynamic';
import CategoryCard from '@/features/product/cards/CategoryCard';
import { Loading } from '@/components/ui/Skeleton';
import type { CatalogCategory } from '@/types/product';
import { Wrap } from '@chakra-ui/react';
import { resolveSubcategoryImage } from '@/utils/categoryImages';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

function CategoryCardsInner({ category }: { category?: CatalogCategory }) {
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
				/>
			))}
		</Wrap>
	);
}

const DynamicCategoryCards = dynamic(() => Promise.resolve(CategoryCardsInner), {
	ssr: false,
	loading: () => <Loading />,
});

export default function CategoryCards({ category }: { category: CatalogCategory }) {
	return <DynamicCategoryCards category={category} />;
}
