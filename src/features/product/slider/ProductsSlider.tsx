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
import { useInViewport } from '@/hooks/useInViewport';

const MAX_VISIBLE_PRODUCT_SLIDES = 6;

type Props = {
	products?: SubcategoryProduct[] | null;
	// When true, Swiper doesn't mount until this slider scrolls near the
	// viewport. The homepage stacks up to 6 of these sections; mounting them
	// all at once means 6 Swiper instances measuring/writing slide widths in
	// the same burst, which is what PageSpeed Insights' "forced reflow"
	// diagnostic was flagging. Opt-in (not the default) because it delays a
	// section's first paint until it's scrolled near — wrong choice for a
	// slider that's already at/near the fold on load (see page.tsx for which
	// sections pass this).
	lazyMount?: boolean;
};

function ProductsSwiper({
	products,
	imagePriorityEligible,
}: {
	products: SubcategoryProduct[];
	imagePriorityEligible: boolean;
}) {
	const hasMultipleProducts = products.length > 1;
	// `loop` (Swiper clones real slides before/after the set to fake infinite
	// scroll) needs a minimum real-slide count relative to slidesPerView for
	// that clone bookkeeping to stay consistent — with only ~10 products in a
	// section and slidesPerView up to 6 (widest productsBreakpoints tier),
	// that minimum wasn't reliably met even with slidesPerGroup=1, so "next"
	// would advance once and then silently stop responding (loop's internal
	// clone buffer — `loopedSlides`, derived from slidesPerGroup — was too
	// thin to keep repositioning correct across repeated clicks). Loop mode
	// hitting this same class of edge case has also previously shown up in
	// production as an insertBefore HierarchyRequestError crash.
	// `rewind` avoids all of that: no clones, no DOM reordering, it just
	// slideTo(0)'s when "next" is clicked at the end (and mirrors for "prev"
	// at the start) — see swiper-core's slideNext/slidePrev. Works reliably
	// for any real slide count, which is what "infinite" navigation actually
	// needs here.
	const canWrap = hasMultipleProducts;

	return (
		<Swiper
			rewind={canWrap}
			navigation={hasMultipleProducts}
			breakpoints={productsBreakpoints}
			slidesPerView={1}
			slidesPerGroup={1}
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
						<ProductCard
							product={p}
							imagePriority={imagePriorityEligible && index < MAX_VISIBLE_PRODUCT_SLIDES}
						/>
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

export default function ProductsSlider({ products, lazyMount = false }: Props) {
	const { ref, isInViewport } = useInViewport<HTMLDivElement>();

	if (lazyMount && !isInViewport) {
		return (
			<Box ref={ref}>
				<ProductCardsSkeletonGrid />
			</Box>
		);
	}

	// Only the eager (non-lazyMount) section is actually above the fold on
	// load — see page.tsx's "popular" section. Sliders that opted into
	// lazyMount are off-screen at load, so marking their images `priority`
	// just competes with the real LCP candidate instead of helping it.
	return (
		<DynamicProductsSwiper products={products ?? []} imagePriorityEligible={!lazyMount} />
	);
}
