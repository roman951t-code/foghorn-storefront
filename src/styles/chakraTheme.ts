import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	strictTokens: false,
	theme: {
		breakpoints: {
			xs: '420px',
			sm: '560px',
			md: '768px',
			lg: '960px',
			xl: '1200px',
		},
		semanticTokens: {
			colors: {
				bg: {
					DEFAULT: {
						value: '{colors.bg.subtle}',
					},
					primary: {
						value: {
							base: 'linear-gradient(90deg, rgba(234,236,238, 1) 0%, rgba(240,242,244,1) 25%, rgba(244,246, 248, 1) 50%, rgba(240,242,244,1) 75%, rgba(234,236,238, 1) 100%)',
							_dark: '#101010',
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
							base: 'rgba(244,246,248, 1)',
							_dark: '#1F202C',
						},
					},
					dark: {
						value: {
							base: 'rgba(91,90,129,1)',
							_dark: '#1F202C',
						},
					},
					accent: {
						value: '{colors.yellow.400}',
					},
				},
				bgHover: {
					DEFAULT: {
						value: {
							base: 'white',
							_dark: 'rgba(234,236,238, 1)',
						},
					},
					accent: {
						value: '{colors.yellow.500}',
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

		'.chakra-card__root .chakra-button svg': {
			height: '22px !important',
			width: '22px !important',
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
		'.chakra-radio-group__item > span:first-of-type:not(.chakra-radio-group__itemText)': {
			color: 'var(--chakra-colors-fg) !important',
		},
		'.chakra-checkbox__control': { color: 'var(--chakra-colors-fg) !important' },
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
	},
});

const system = createSystem(defaultConfig, config);

export default system;
