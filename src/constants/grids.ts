export const PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	'@media (min-width: 599px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 770px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 912px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 1112px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 1511px)': {
		gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	},
} as const;
