import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	strictTokens: false,
	theme: {
		breakpoints: {
			xs: '430px',
			sm: '560px',
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
							_dark: '#272834',
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
						value: '{colors.gray.200}',
					},
				},
				bgHover: {
					DEFAULT: {
						value: 'rgb(234,236,238)',
					},
					accent: {
						value: '{colors.yellow.500}',
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
		},

		form: {
			width: '100%',
		},
		svg: {
			display: 'inline',
		},
		'.productsSlider .swiper-button-prev:after, .productsSlider .swiper-button-next:after': {
			color: 'var(--chakra-colors-fg)',
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
		'.rce-container-input': {
			backgroundColor: 'transparent !important',
			minWidth: 'initial !important',
			width: '100%',
		},
		'.rce-input': {
			color: 'var(--chakra-colors-fg) !important',
			paddingLeft: '12px !important',
			borderStartEndRadius: '0 !important',
			borderEndEndRadius: '0 !important',
		},
		'.rce-button': {
			backgroundColor: 'var(--chakra-colors-bg-accent) !important',
			color: 'var(--chakra-colors-black) !important',
			fontSize: '14px !important',
			fontWeight: '500 !important',
			borderStartStartRadius: '0 !important',
			borderEndStartRadius: '0 !important',
			width: '120px',
		},
		'.rce-mbox': {
			backgroundColor: 'var(--chakra-colors-bg) !important',
			padding: '14px !important',
			minWidth: '240px !important',
		},
		'.rce-mbox-left-notch, .rce-mbox-right-notch': {
			fill: 'var(--chakra-colors-bg) !important',
		},
		'.rce-container-mbox': {
			overflow: 'initial !important',
		},
		'.rce-mbox-text, .rce-mbox-title, .rce-mbox-time': {
			fontSize: '14px !important',
		},
		'.rce-mbox-title': {
			fontSize: '16px !important',
			color: 'var(--chakra-colors-main-accent) !important',
		},
		'.rce-mbox-time': {
			color: 'var(--chakra-colors-fg-muted) !important',
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
