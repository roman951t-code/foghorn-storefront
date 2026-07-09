import { PRODUCT_CARD_HORIZONTAL_GAP_PX } from '@/constants/grids';

// Same column-count thresholds as CABINET_PRODUCTS_GRID_CSS (grids.ts) —
// this slider and that grid share the same sidebar-less container width, so
// they need the same breakpoints to keep card width in the same band.
export const productsBreakpoints = {
	532: { slidesPerView: 2, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	798: { slidesPerView: 3, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1052: { slidesPerView: 4, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1306: { slidesPerView: 5, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	// See CABINET_PRODUCTS_GRID_CSS's 6th tier comment in grids.ts — this is
	// the '2xl' breakpoint (1536px) plus the usual scrollbar buffer, past
	// which the container is a fixed 1512px and 6 columns fit exactly.
	1556: { slidesPerView: 6, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
};

export const promoBreakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
	1564: { slidesPerView: 3 },
};
