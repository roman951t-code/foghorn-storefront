export const PRODUCT_CARD_HORIZONTAL_GAP_PX = 8;
export const PRODUCT_CARD_HORIZONTAL_GAP = `${PRODUCT_CARD_HORIZONTAL_GAP_PX}px`;

// Card width band. Max is min + 10%.
export const PRODUCT_CARD_MIN_WIDTH_PX = 246;
export const PRODUCT_CARD_MAX_WIDTH_PX = 271;
const CARD_MINMAX = `minmax(${PRODUCT_CARD_MIN_WIDTH_PX}px, ${PRODUCT_CARD_MAX_WIDTH_PX}px)`;

// Separate width band for PRODUCTS_GRID_CSS only (category/subcategory/
// search listing pages), decoupled from the shared CARD_MINMAX band used by
// CABINET_PRODUCTS_GRID_CSS (that one's intentionally left alone).
// ProductsSlider (the homepage/viewed-products swiper) reuses this same
// band and its `cardSm` breakpoint (theme.breakpoints, chakraTheme.ts) so
// both places render identically-sized cards. ProductPreviewSlider's
// `sizes` attribute reads PRODUCTS_GRID_CARD_MAX_WIDTH_PX too, so the
// largest rendered card still gets a sharp (non-upscaled) image.
export const PRODUCTS_GRID_CARD_MIN_WIDTH_PX = 240;
export const PRODUCTS_GRID_CARD_MAX_WIDTH_PX = 300;
const PRODUCTS_GRID_CARD_MINMAX = `minmax(${PRODUCTS_GRID_CARD_MIN_WIDTH_PX}px, ${PRODUCTS_GRID_CARD_MAX_WIDTH_PX}px)`;

// Breakpoints below are derived from the actual layout math, not scaled from
// old numbers (a scaled threshold doesn't guarantee N columns at MIN width +
// (N-1) gaps actually fit the container, so the grid silently overflowed and
// the browser had no room left for the gap). Both grids share:
//   - a 24px total side margin (mx: 12px base, 0 from the '2xl' breakpoint —
//     every threshold below stays well under that breakpoint, so 24px
//     always applies here)
//   - a 20px safety buffer for a vertical scrollbar. Media queries match
//     against window.innerWidth, but the space actually available to page
//     content is document.documentElement.clientWidth, which a scrollbar
//     shrinks by ~15-17px on non-overlay-scrollbar systems. Without this
//     buffer, a column tier can turn on right where there's *almost* but
//     not quite enough room, and the grid compresses the gap to fit instead
//     of respecting it (confirmed empirically: at exactly the unbuffered
//     3-column threshold, the gap shrank from 8px to 5px).
//   - the storefront's own 1512px content cap (Header's <main maxW="1512px">)
//
// PRODUCTS_GRID_CSS (category/subcategory/search listing pages) additionally
// loses a 304px filters sidebar + 12px gap once the sidebar appears at the
// 'lg' (960px) breakpoint. At this grid's 240px MIN, a 3-column tier can't
// survive that transition: 3 columns need 3*240 + 2*8 = 736px, but only
// ~600px is available right at 960px (960 - 20 buffer - 24 margin - 316
// sidebar). Rather than delay 3 columns until the sidebar-safe width (giving
// up the free space the hidden sidebar leaves below 960px), this grid turns
// 3 columns on early (780px, sidebar-less math) and explicitly steps back
// down to 2 at 960px — the exact width the sidebar appears, matching
// `hideBelow='lg'` on the sidebar `Box` — then back up to 3 once there's
// room again with the sidebar accounted for. Dragging a window slowly
// through 960-1096px is the one case that'll see a 3→2→3 wobble; every
// fixed viewport width (the vast majority of real visits) just sees the
// most columns that actually fit. The ceiling is 4, not 5: 5*240 + 4*8 =
// 1232px would be needed at the hard ceiling (1444 content cap - 316
// sidebar = 1128px available at most), which doesn't fit — 4 columns
// (960 + 24 = 984px) does.
export const PRODUCTS_GRID_CSS = {
	// Single card fills the full row on phones (no minmax cap) instead of
	// being stuck at a fixed max width with blank space beside it — modern
	// mobile listings favor a full-bleed card here. Once a second column
	// fits, cards go back to the fixed min/max band and default (left)
	// alignment, same as every other breakpoint.
	gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
	// 533px, not 532: matches the `cardSm` breakpoint ProductCard/ProductsSlider
	// use for their own mobile-vs-normal sizing switch, so 532px and below is
	// consistently "full-width mobile card" everywhere (a plain `min-width:
	// 532px` here would flip this grid to 2 columns one pixel before the card
	// itself switches out of its mobile styling).
	'@media (min-width: 532px)': {
		gridTemplateColumns: `repeat(2, ${PRODUCTS_GRID_CARD_MINMAX})`,
	},
	'@media (min-width: 780px)': {
		gridTemplateColumns: `repeat(3, ${PRODUCTS_GRID_CARD_MINMAX})`,
	},
	'@media (min-width: 960px)': {
		gridTemplateColumns: `repeat(2, ${PRODUCTS_GRID_CARD_MINMAX})`,
	},
	'@media (min-width: 1096px)': {
		gridTemplateColumns: `repeat(3, ${PRODUCTS_GRID_CARD_MINMAX})`,
	},
	'@media (min-width: 1344px)': {
		gridTemplateColumns: `repeat(4, ${PRODUCTS_GRID_CARD_MINMAX})`,
	},
} as const;

// This grid's 6th tier is a special case: it only turns on at the '2xl'
// breakpoint (1536px — still Chakra's default, since this theme's custom
// `breakpoints` only redefines xs/sm/md/lg/xl and never touches '2xl'),
// which is exactly the point where these pages' own outer margin (mx)
// drops from 12px to 0, so the grid's available width becomes a *fixed*
// 1512px (the storefront's content cap) for any viewport from there up —
// it can never grow further. 6 columns at the normal 246-271px band would
// need up to 1516px, more than that fixed 1512px allows, so this tier uses
// its own smaller band sized to fill exactly 1512px (6*234 + 5*8 = 1444).
// The 1556px threshold (1536 + the same 20px scrollbar buffer as above)
// guards against firing before the mx:0 margin change has actually landed.
const SIX_COLUMN_MINMAX = 'minmax(220px, 234px)';

export const CABINET_PRODUCTS_GRID_CSS = {
	gridTemplateColumns: `repeat(1, ${CARD_MINMAX})`,
	'@media (min-width: 532px)': {
		gridTemplateColumns: `repeat(2, ${CARD_MINMAX})`,
	},
	'@media (min-width: 798px)': {
		gridTemplateColumns: `repeat(3, ${CARD_MINMAX})`,
	},
	'@media (min-width: 1052px)': {
		gridTemplateColumns: `repeat(4, ${CARD_MINMAX})`,
	},
	'@media (min-width: 1306px)': {
		gridTemplateColumns: `repeat(5, ${CARD_MINMAX})`,
	},
	'@media (min-width: 1556px)': {
		gridTemplateColumns: `repeat(6, ${SIX_COLUMN_MINMAX})`,
	},
} as const;

// The catalog mega-menu's subcategory list sits beside a fixed-ish-width
// hero panel that only appears from `lg` up (see CategoryDetails.tsx), so
// the space actually available to this column here is *not* a clean
// function of viewport width — it shrinks the moment that hero panel
// appears, then grows again as the viewport keeps widening. Rather than
// chase that with manual breakpoints (as the grids above do, where it's
// worth the precision for primary product listings), `column-width` lets
// the browser fit as many ~240px columns as the *actual* container width
// allows, so it naturally adapts to that non-monotonic available space
// without any media queries. `columnCount` just caps it at 3 so it doesn't
// fragment into a wall of skinny columns on ultra-wide viewports. 240px
// (not the previous 192px) gives the 80px subcategory thumbnail + title
// room to breathe, and keeps the product-name list beneath it from feeling
// cramped now that a subcategory can show up to 10 of them.
export const CATEGORY_DETAILS_COLUMNS_CSS = {
	columnWidth: '234px',
	columnCount: 3,
	columnGap: '20px',
} as const;
