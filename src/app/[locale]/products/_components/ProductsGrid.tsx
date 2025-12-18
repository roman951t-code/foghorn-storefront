'use client';
import { SimpleGrid, Box, VStack, useMediaQuery, EmptyState } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '@/features/product/cards/ProductCard';
import { SubcategoryProduct } from '@/types/product';
import { useEffect, useMemo, useState } from 'react';
import { LoadingSkeleton } from '@/components/ui/Skeleton';

interface Props {
	products: SubcategoryProduct[];
	notFound: string;
	limit?: number;
}

export default function ProductsGrid({ products, notFound, limit }: Props) {
	const [isClient, setIsClient] = useState(false);
	const [is1430, is1050, is960, is810, is630, is560] = useMediaQuery([
		'(min-width: 1430px)',
		'(min-width: 1050px)',
		'(min-width: 960px)',
		'(min-width: 810px)',
		'(min-width: 560px)',
		'(min-width: 450px)',
	]);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const skeletonCount = useMemo(
		() => Math.max(1, limit ?? products?.length ?? 6),
		[limit, products?.length]
	);

	if (!isClient) {
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
					<Box key={`products-grid-skeleton-${index}`}>
						<LoadingSkeleton />
					</Box>
				))}
			</SimpleGrid>
		);
	}

	if (!products || products.length === 0) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{notFound}</EmptyState.Title>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	let columns = 1;
	if (is1430) columns = 4;
	else if (is1050) columns = 3;
	else if (is960) columns = 2;
	else if (is810) columns = 3;
	else if (is630) columns = 2;
	else if (is560) columns = 1;

	const visibleProducts = limit ? products.slice(0, limit) : products;

	return (
		<SimpleGrid
			className='productsSlider'
			columns={columns}
			columnGap={2}
			rowGap={4}
			px={{ base: 1, sm: 0 }}
		>
			{visibleProducts.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	);
}
