'use client';

import { Skeleton, SimpleGrid, type SimpleGridProps, useMediaQuery } from '@chakra-ui/react';
import { productsBreakpoints } from '@/data/breakpoints';
import { PRODUCT_CARD_HORIZONTAL_GAP } from '@/constants/grids';

type Props = Omit<SimpleGridProps, 'columns' | 'children'> & {
	limit?: number;
};

const PRODUCT_SLIDER_SKELETON_GRID_CSS = Object.fromEntries(
	Object.entries(productsBreakpoints).map(([minWidth, value]) => [
		`@media (min-width: ${minWidth}px)`,
		{ gridTemplateColumns: `repeat(${value.slidesPerView}, minmax(204px, 1fr))` },
	]),
);

export default function ProductCardsSkeletonGrid({ limit, className, ...restProps }: Props) {
	const breakpointsDesc = Object.entries(productsBreakpoints)
		.map(([minWidth, value]) => ({
			minWidth: Number(minWidth),
			slides: Number(value?.slidesPerView ?? 1),
		}))
		.filter((b) => Number.isFinite(b.minWidth) && Number.isFinite(b.slides) && b.slides >= 1)
		.sort((a, b) => b.minWidth - a.minWidth);

	const queries = breakpointsDesc.map((b) => `(min-width: ${b.minWidth}px)`);
	const matches = useMediaQuery(queries);

	const slidesPerView = breakpointsDesc.find((_, idx) => matches[idx])?.slides ?? 1;

	const skeletonCount = Math.max(1, limit ? Math.min(limit, slidesPerView) : slidesPerView);

	return (
		<SimpleGrid
			mt='8'
			mb='4'
			className={className ?? 'productsSlider'}
			css={{
				gridTemplateColumns: 'repeat(1, minmax(204px, 1fr))',
				...PRODUCT_SLIDER_SKELETON_GRID_CSS,
			}}
			columnGap={PRODUCT_CARD_HORIZONTAL_GAP}
			gapY='4'
			w='100%'
			{...restProps}
		>
			{Array.from({ length: limit ?? skeletonCount }).map((_, index) => (
				<Skeleton
					key={`product-cards-skeleton-${index}`}
					w='full'
					minW='204px'
					h={{ base: '316px', md: '300px' }}
					rounded='md'
					aria-hidden='true'
				/>
			))}
		</SimpleGrid>
	);
}
