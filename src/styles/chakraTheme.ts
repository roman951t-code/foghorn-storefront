import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	strictTokens: false,
	theme: {
		tokens: {
			fonts: {
				body: { value: '"SF NS", -apple-system, system-ui, sans-serif' },
				heading: { value: 'var(--font-montserrat), var(--font-open-sans), system-ui, sans-serif' },
				link: { value: 'var(--font-noto-sans), var(--font-open-sans), system-ui, sans-serif' },
				ui: { value: '"SF NS", -apple-system, system-ui, sans-serif' },
			},
		},
		breakpoints: {
			xs: '430px',
			sm: '536px',
			md: '768px',
			lg: '960px',
			xl: '1200px',

			prodXs: '430px',
			prodSm: '630px',
			prodMd: '840px',
			prodLg: '1210px',
			prodXl: '1290px',

			gridXs: '444px',
			gridSm: '648px',
			gridMd: '848px',
			gridLg: '960px',
			gridXl: '1090px',
			grid2Xl: '1290px',
		},
		semanticTokens: {
			colors: {
				catalog: {
					bgEven: {
						value: {
							base: 'rgb(240,242,244)',
							_dark: '#272834',
						},
					},
					bgOdd: {
						value: {
							base: 'rgb(244,246,248)',
							_dark: '#1F202C',
						},
					},
					bgCategory: {
						value: {
							base: 'rgb(244,246,248)',
							_dark: '#272838',
						},
					},
				},
				bg: {
					DEFAULT: {
						value: '{colors.bg.subtle}',
					},
					primary: {
						value: {
							base: 'linear-gradient(90deg, rgba(234,236,238, 1) 0%, rgba(240,242,244,1) 25%, rgba(244,246, 248, 1) 50%, rgba(240,242,244,1) 75%, rgba(234,236,238, 1) 100%)',
							_dark: '#161620',
						},
					},
					secondary: {
						value: {
							base: 'linear-gradient(36deg, rgba(91,90,129,1) 0%, rgb(70, 108, 134) 50%, rgba(91,90,129,1) 100%)',
							_dark: '#272838',
						},
					},
					tertiary: {
						value: {
							base: 'rgb(244,246,248)',
							_dark: '#1F202C',
						},
					},
					accent: {
						value: '{colors.yellow.400}',
					},
					dark: {
						value: {
							base: 'rgb(244,246,248)',
							_dark: '#1F202C',
						},
					},
					search: {
						value: {
							base: '{colors.gray.200}',
							_dark: '{colors.gray.300}',
						},
					},
				},
				bgHover: {
					DEFAULT: {
						value: 'rgb(234,236,238)',
					},
					accent: {
						value: '{colors.yellow.500}',
					},
					promoCard: {
						value: {
							base: 'rgb(234,236,238)',
							_dark: '{colors.gray.800}',
						},
					},
					button: {
						value: {
							base: '{colors.yellow.500}',
							_dark: '{colors.gray.100}',
						},
					},
				},
				main: {
					DEFAULT: {
						value: '{colors.bg.fg}',
					},
					lightOnly: { value: '{colors.gray.50}' },
					darkOnly: { value: '{colors.gray.900}' },
					secondary: { value: '{colors.yellow.400}' },
					tertiary: { value: '{colors.red.400}' },
					accent: { value: '{colors.orange.400}' },
					disabled: { value: '{colors.fg.muted}' },
				},
				border: {
					DEFAULT: {
						value: '{colors.bg.fg}',
					},
					light: {
						value: {
							base: '{colors.gray.200}',
							_dark: '{colors.gray.500}',
						},
					},
					dark: {
						value: {
							base: '{colors.gray.300}',
							_dark: '{colors.gray.700}',
						},
					},
					disabled: { value: '{colors.fg.muted}' },
				},
				link: {
					DEFAULT: {
						value: {
							base: '#3e3c78',
							_dark: '{colors.yellow.400}',
						},
					},
				},
			},
		},
	},
	globalCss: {
		'html, body': {
			margin: 0,
			padding: 0,
		},
		body: {
			display: 'flex',
			flexDirection: 'column',
			minWidth: '350px',
			fontFamily: '"SF NS", -apple-system, system-ui, sans-serif',
			textRendering: 'optimizeLegibility',
		},

		form: {
			width: '100%',
		},
		svg: {
			display: 'inline',
		},
		a: {
			fontFamily: 'var(--font-noto-sans), var(--font-open-sans), system-ui, sans-serif',
			fontWeight: 500,
			fontSize: 16,
		},
		'h1,h2,h3,h4,h5,h6, .chakra-heading': {
			fontFamily: 'var(--font-montserrat), var(--font-open-sans), system-ui, sans-serif !important',
		},
		'p, span, li': {
			fontFamily: '"SF NS", -apple-system, system-ui, sans-serif',
			fontWeight: 500,
		},
		'.chakra-stat__valueText': {
			fontFamily: 'system-ui',
		},
		'label, button, input, textarea, select, small': {
			fontFamily: '"SF NS", -apple-system, system-ui, sans-serif',
		},
		'.swiper-button-prev,.swiper-button-next': {
			color: 'var(--chakra-colors-fg) !important',
		},
		'.thumbsSlider .swiper-button-prev:after, .thumbsSlider .swiper-button-next:after': {
			color: 'var(--chakra-colors-bg-inverted) !important',
			fontSize: '24px !important',
			backgroundColor: 'transparent',
			padding: '8px',
			borderRadius: '60%',
		},
		'.thumbsSlider .swiper-button-prev, .thumbsSlider .swiper-button-next': {
			backgroundColor: 'bg',
			borderWidth: '0.5px',
			borderRadius: '6px',
			borderColor: 'var(--chakra-colors-border-light)',
			height: '90px !important',
			width: '30px !important',
		},
		'.thumbsSlider .swiper-button-prev .swiper-navigation-icon, .thumbsSlider .swiper-button-next .swiper-navigation-icon':
			{
				height: '52px !important',
				width: '16px !important',
			},

		'.ReactModal__Overlay': {
			opacity: 0,
			transition: 'opacity 150ms ease-in-out',
		},

		'.ReactModal__Overlay--after-open': {
			opacity: 1,
		},

		'.ReactModal__Overlay--before-close': {
			opacity: 0,
		},
		'.ReactModal__Content': {
			backgroundColor: 'var(--chakra-colors-bg-tertiary) !important',
		},
		'.chakra-radio-group__item > span:first-of-type:not(.chakra-radio-group__itemText)[data-state="unchecked"]':
			{
				color: 'var(--chakra-colors-fg) !important',
			},
		'.chakra-checkbox__control[data-state="unchecked"]': {
			color: 'var(--chakra-colors-fg) !important',
		},
		'.thumbsSlider .swiper-pagination-bullet': {
			width: '20px !important',
			height: '20px !important',
			textAlign: 'center !important',
			lineHeight: '20px !important',
			fontSize: '12px !important',
			color: 'var(--chakra-colors-bg-subtle) !important',
			backgroundColor: 'var(--chakra-colors-bg-inverted) !important',
			opacity: '.8 !important',
		},
		'.thumbsSlider .swiper-pagination-bullet-active': {
			backgroundColor: 'var(--chakra-colors-main-accent) !important',
			opacity: '1 !important',
		},
		'.thumbsSlider .swiper-pagination': {
			bottom: '0 !important',
		},
		'.chakra-tabs__trigger:is([aria-selected=true], [data-selected])[data-orientation=vertical]': {
			textDecoration: 'underline',
			textUnderlineOffset: '4px !important',
			'--mix-textDecorationColor': 'color-mix(in srgb, currentColor 40%, transparent)',
			textDecorationColor: 'var(--mix-textDecorationColor, currentColor) !important',
		},
		'.tabLink': {
			height: '100%',
			width: '100%',
		},
		'span.chakra-rating-group__item:not([data-highlighted]) path, span.chakra-rating-group__item[data-half] svg:first-of-type path':
			{
				color: 'var(--mix-textDecorationColor, lightgray) !important',
			},
	},
});

const system = createSystem(defaultConfig, config);

export default system;
