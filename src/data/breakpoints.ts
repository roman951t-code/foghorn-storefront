import { PRODUCT_CARD_HORIZONTAL_GAP_PX } from '@/constants/grids';

// Same column-count thresholds as CABINET_PRODUCTS_GRID_CSS (grids.ts) —
// this slider and that grid share the same sidebar-less container width, so
// they need the same breakpoints to keep card width in the same band. See
// that grid's comments for how these are derived (N*MIN + (N-1)*gap + 32px
// page margin + 20px scrollbar buffer, capped by a smaller band once 6
// columns won't fit in the storefront's 1512px content cap).
// slidesPerGroup matches slidesPerView at every tier so nav arrows/swipes
// always advance by exactly one full "page" of visible cards — without this,
// ProductsSlider's own static slidesPerGroup={2} advances by 2 even at the
// base (sub-552px) tier, where slidesPerView is 1, skipping every other card
// on phones instead of moving one at a time.
export const productsBreakpoints = {
	552: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	806: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1060: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1314: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1412: { slidesPerView: 6, slidesPerGroup: 6, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
};

export const promoBreakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
	1564: { slidesPerView: 3 },
};
