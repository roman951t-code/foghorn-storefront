'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import ProductsSection from './ProductsSection';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { SubcategoryProduct } from '@/types/product';

interface Props {
	title: string;
	tag?: string;
	limit?: number;
}

export default function ViewedProductsSection({ title, tag, limit }: Props) {
	const [products, setProducts] = useState<SubcategoryProduct[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();

		(async () => {
			try {
				const query = limit ? `?limit=${limit}` : '';
				const res = await fetch(`/api/viewed-products${query}`, {
					credentials: 'include',
					signal: controller.signal,
				});

				if (!res.ok) {
					setProducts([]);
					return;
				}

				const data = (await res.json()) as { products?: SubcategoryProduct[] };
				setProducts(data?.products ?? []);
			} catch {
				setProducts([]);
			} finally {
				setLoading(false);
			}
		})();

		return () => controller.abort();
	}, [limit]);

	const skeletonCount = useMemo(() => Math.max(1, limit ?? 6), [limit]);

	if (loading) {
		return (
			<SimpleGrid
				mt='8'
				mb='4'
				className='productsSlider'
				columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
				gapX='2'
				gapY='4'
				w='100%'
			>
				{Array.from({ length: skeletonCount }).map((_, index) => (
					<Box key={`viewed-skeleton-${index}`}>
						<LoadingSkeleton />
					</Box>
				))}
			</SimpleGrid>
		);
	}

	if (!products || products.length === 0) return null;

	return <ProductsSection title={title} tag={tag} products={products} />;
}
