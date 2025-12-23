export const PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	'@media (min-width: 630px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 810px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 960px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 1050px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 1430px)': {
		gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	},
} as const;
