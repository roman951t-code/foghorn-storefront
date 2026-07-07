'use client';

import { Box } from '@chakra-ui/react';
import ProductCard from '@/features/product/cards/ProductCard';
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { SubcategoryProduct } from '@/types/product';
import { productsBreakpoints } from '@/data/breakpoints';
import { PRODUCT_CARD_HORIZONTAL_GAP_PX, PRODUCTS_GRID_CARD_MAX_WIDTH_PX } from '@/constants/grids';
import ProductCardsSkeletonGrid from '@/components/ui/ProductCardsSkeletonGrid';

const MAX_VISIBLE_PRODUCT_SLIDES = 6;

type Props = {
	products?: SubcategoryProduct[] | null;
};

function ProductsSwiper({ products }: { products: SubcategoryProduct[] }) {
	const hasMultipleProducts = products.length > 1;

	return (
		<Swiper
			loop={hasMultipleProducts}
			loopAddBlankSlides={false}
			navigation={hasMultipleProducts}
			breakpoints={productsBreakpoints}
			slidesPerView={1}
			slidesPerGroup={hasMultipleProducts ? 2 : 1}
			spaceBetween={PRODUCT_CARD_HORIZONTAL_GAP_PX}
			modules={[Navigation]}
			className='productsSlider'
		>
			{products.map((p, index) => (
				<SwiperSlide key={p?.id}>
					{/* .productsSlider .swiper-slide (swiper.css) is a centered flex
					    container, so capping the card's width here just centers it
					    within its slide instead of letting it grow past the same max
					    width used by PRODUCTS_GRID_CSS. Uncapped below 532px so a
					    single-slide-per-view phone layout fills the row too, not just
					    the grid pages — 532 (not `cardSm`'s 533) because that's this
					    swiper's *own* 1-vs-2-slide threshold (productsBreakpoints'
					    first key, src/data/breakpoints.ts); capping any earlier would
					    leave a still-single, now-artificially-narrow slide with dead
					    space on both sides right before Swiper actually adds a second
					    slide per view. */}
					<Box
						w='full'
						css={{
							maxWidth: 'none',
							'@media (min-width: 532px)': {
								maxWidth: `${PRODUCTS_GRID_CARD_MAX_WIDTH_PX}px`,
							},
						}}
					>
						<ProductCard product={p} imagePriority={index < MAX_VISIBLE_PRODUCT_SLIDES} />
					</Box>
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicProductsSwiper = dynamic(() => Promise.resolve(ProductsSwiper), {
	ssr: false,
	loading: () => <ProductCardsSkeletonGrid />,
});

export default function ProductsSlider({ products }: Props) {
	return <DynamicProductsSwiper products={products ?? []} />;
}
