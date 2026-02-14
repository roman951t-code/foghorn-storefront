export const PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	'@media (min-width: 548px)': {
		gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	},
	'@media (min-width: 548px) and (max-width: 814px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 814px) and (max-width: 960px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 960px) and (max-width: 1124px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 1124px) and (max-width: 1374px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 1374px)': {
		gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	},
} as const;

export const CABINET_PRODUCTS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	'@media (min-width: 564px)': {
		gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	},
	'@media (min-width: 564px) and (max-width: 824px)': {
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	},
	'@media (min-width: 824px) and (max-width: 1074px)': {
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	},
	'@media (min-width: 1074px) and (max-width: 1318px)': {
		gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	},
	'@media (min-width: 1318px)': {
		gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
	},
} as const;

export const CATEGORY_DETAILS_GRID_CSS = {
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
} as const;
