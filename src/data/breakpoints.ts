import { PRODUCT_CARD_HORIZONTAL_GAP_PX } from '@/constants/grids';

export const productsBreakpoints = {
	620: { slidesPerView: 2, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	856: { slidesPerView: 3, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1084: { slidesPerView: 4, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1312: { slidesPerView: 5, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
	1480: { slidesPerView: 6, spaceBetween: PRODUCT_CARD_HORIZONTAL_GAP_PX },
};

export const promoBreakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
	1564: { slidesPerView: 3 },
};
