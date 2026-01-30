'use client';

import { Box, SimpleGrid, type SimpleGridProps, useMediaQuery } from '@chakra-ui/react';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { productsBreakpoints } from '@/data/breakpoints';

type Props = Omit<SimpleGridProps, 'columns' | 'children'> & {
	limit?: number;
};

export default function ProductCardsSkeletonGrid({
	limit,
	className,
	...restProps
}: Props) {
	const breakpointsDesc = Object.entries(productsBreakpoints)
		.map(([minWidth, value]) => ({
			minWidth: Number(minWidth),
			slides: Number(value?.slidesPerView ?? 1),
		}))
		.filter((b) => Number.isFinite(b.minWidth) && Number.isFinite(b.slides) && b.slides >= 1)
		.sort((a, b) => b.minWidth - a.minWidth);

	const queries = breakpointsDesc.map((b) => `(min-width: ${b.minWidth}px)`);
	const matches = useMediaQuery(queries);

	const slidesPerView =
		breakpointsDesc.find((_, idx) => matches[idx])?.slides ??
		productsBreakpoints?.[532]?.slidesPerView ??
		1;

	const skeletonCount = Math.max(1, limit ? Math.min(limit, slidesPerView) : slidesPerView);

	return (
		<SimpleGrid
			mt='8'
			mb='4'
			className={className ?? 'productsSlider'}
			columns={skeletonCount}
			gapX='2'
			gapY='4'
			w='100%'
			{...restProps}
		>
			{Array.from({ length: skeletonCount }).map((_, index) => (
				<Box key={`product-cards-skeleton-${index}`}>
					<LoadingSkeleton />
				</Box>
			))}
		</SimpleGrid>
	);
}
