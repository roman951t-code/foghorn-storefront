import { PRODUCT_CARD_HORIZONTAL_GAP_PX } from '@/constants/grids';

// Same column-count thresholds as CABINET_PRODUCTS_GRID_CSS (grids.ts) —
// this slider and that grid share the same sidebar-less container width, so
// they need the same breakpoints to keep card width in the same band. See
// that grid's comments for how these are derived (N*MIN + (N-1)*gap + 32px
// page margin + 20px scrollbar buffer, capped by a smaller band once 6
// columns won't fit in the storefront's 1512px content cap).
// slidesPerGroup is pinned to 1 at every tier, deliberately *not* matching
// slidesPerView: a section's real product count is whatever the catalog
// returns (DEFAULT_PRODUCTS_SECTION_LIMIT = 10, not guaranteed divisible by
// 2/3/4/5/6), and in loop mode a slidesPerGroup that doesn't evenly divide
// the real slide count leaves Swiper's "next" navigation permanently stuck
// once it reaches the last full page (isEnd stays true and further clicks
// no-op instead of wrapping) — observed in production as the right arrow
// working exactly once. slidesPerGroup=1 sidesteps that divisibility
// requirement entirely (every count divides evenly by 1) and still never
// skips a card, since moving one at a time can't skip anything regardless
// of how many are visible.
export const productsBreakpoints = {
	552: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	806: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1060: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1314: { slidesPerView: 5, slidesPerGroup: 1, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1412: { slidesPerView: 6, slidesPerGroup: 1, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
};

export const promoBreakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
	1564: { slidesPerView: 3 },
};
