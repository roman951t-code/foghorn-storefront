export const PRODUCT_CARD_HORIZONTAL_GAP_PX = 8;
export const PRODUCT_CARD_HORIZONTAL_GAP = `${PRODUCT_CARD_HORIZONTAL_GAP_PX}px`;

export const PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(204px, 1fr))',
	'@media (min-width: 620px)': {
		gridTemplateColumns: 'repeat(2, minmax(204px, 1fr))',
	},
	'@media (min-width: 944px)': {
		gridTemplateColumns: 'repeat(3, minmax(204px, 1fr))',
	},
	'@media (min-width: 1164px)': {
		gridTemplateColumns: 'repeat(4, minmax(204px, 1fr))',
	},
	'@media (min-width: 1368px)': {
		gridTemplateColumns: 'repeat(5, minmax(204px, 1fr))',
	},
} as const;

export const CABINET_PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(204px, 1fr))',
	'@media (min-width: 620px)': {
		gridTemplateColumns: 'repeat(2, minmax(204px, 1fr))',
	},
	'@media (min-width: 856px)': {
		gridTemplateColumns: 'repeat(3, minmax(204px, 1fr))',
	},
	'@media (min-width: 1084px)': {
		gridTemplateColumns: 'repeat(4, minmax(204px, 1fr))',
	},
	'@media (min-width: 1312px)': {
		gridTemplateColumns: 'repeat(5, minmax(204px, 1fr))',
	},
	'@media (min-width: 1480px)': {
		gridTemplateColumns: 'repeat(6, minmax(204px, 1fr))',
	},
} as const;

export const CATEGORY_DETAILS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
} as const;
