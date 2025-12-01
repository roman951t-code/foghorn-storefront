'use client';

import dynamic from 'next/dynamic';
import CategoryCard from '@/features/product/cards/CategoryCard';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import type { CatalogCategory } from '@/types/product';
import { Wrap } from '@chakra-ui/react';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

function CategoryCardsInner({ category }: { category?: CatalogCategory }) {
	console.log('category', category);
	return (
		<Wrap>
			{category?.children.map((sub) => (
				<CategoryCard
					key={sub.id}
					title={sub.name}
					imageUrl={
						sub.products[0]?.imageUrl ??
						'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80'
					}
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
	loading: () => <LoadingSkeleton />,
});

export default function CategoryCards({ category }: { category: CatalogCategory }) {
	return <DynamicCategoryCards category={category} />;
}
