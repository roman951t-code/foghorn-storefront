import {
	createSystem,
	defaultConfig,
	defineConfig,
	defineRecipe,
	defineSlotRecipe,
} from '@chakra-ui/react';

const storefrontInputFocusStyles = {
	borderWidth: '0.5px',
	borderStyle: 'solid',
	borderColor: 'main.secondary',
	outline: 'none',
	boxShadow: 'none',
} as const;

const storefrontFlushedInputFocusStyles = {
	borderColor: 'main.secondary',
	outline: 'none',
	boxShadow: 'none',
} as const;

const chakraDefaultTheme = defaultConfig.theme!;
const chakraDefaultRecipes = chakraDefaultTheme.recipes!;
const chakraDefaultSlotRecipes = chakraDefaultTheme.slotRecipes!;

const config = defineConfig({
	strictTokens: false,
	theme: {
		tokens: {
			fonts: {
				body: {
					value: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
				},
				heading: {
					value:
						'"Open Sans", "Open Sans Fallback", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
				},
				link: {
					value:
						'"Open Sans", "Open Sans Fallback", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
				},
				ui: {
					value: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
				},
			},
			fontWeights: {
				thin: { value: '300' },
				extralight: { value: '200' },
				light: { value: '400' },
				normal: { value: '400' },
			},
			fontSizes: {
				'2xs': { value: '14px' },
				xs: { value: '14px' },
				sm: { value: '14px' },
				md: { value: '16px' },
				lg: { value: '18px' },
				xl: { value: '20px' },
				'2xl': { value: '24px' },
				'3xl': { value: '30px' },
				'4xl': { value: '36px' },
				'5xl': { value: '48px' },
				'6xl': { value: '60px' },
				'7xl': { value: '72px' },
				'8xl': { value: '96px' },
				'9xl': { value: '128px' },
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
					breadcrumb: { value: '{colors.fg}' },
				},
				border: {
					DEFAULT: {
						value: {
							_light: '{colors.gray.300}',
							_dark: '{colors.gray.500}',
						},
					},
					button: {
						value: {
							_light: '{colors.gray.600}',
							_dark: '{colors.gray.300}',
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
		recipes: {
			input: defineRecipe({
				...chakraDefaultRecipes.input,
				defaultVariants: {
					...chakraDefaultRecipes.input.defaultVariants,
					variant: 'flushed',
				},
				variants: {
					...chakraDefaultRecipes.input.variants,
					variant: {
						...chakraDefaultRecipes.input.variants!.variant,
						subtle: {
							...chakraDefaultRecipes.input.variants!.variant.subtle,
							bg: { base: 'transparent', _dark: 'bg.muted' },
							borderWidth: '0.5px',
							borderStyle: 'solid',
							borderColor: 'border.button',
							focusVisibleRing: 'none',
							_focus: storefrontInputFocusStyles,
							_focusVisible: storefrontInputFocusStyles,
						},
						flushed: {
							...chakraDefaultRecipes.input.variants!.variant.flushed,
							focusVisibleRing: 'none',
							_focus: storefrontFlushedInputFocusStyles,
							_focusVisible: storefrontFlushedInputFocusStyles,
						},
					},
				},
			}),
			textarea: defineRecipe({
				...chakraDefaultRecipes.textarea,
				defaultVariants: {
					...chakraDefaultRecipes.textarea.defaultVariants,
					variant: 'subtle',
				},
				variants: {
					...chakraDefaultRecipes.textarea.variants,
					variant: {
						...chakraDefaultRecipes.textarea.variants!.variant,
						subtle: {
							...chakraDefaultRecipes.textarea.variants!.variant.subtle,
							bg: { base: 'transparent', _dark: 'bg.muted' },
							borderWidth: '0.5px',
							borderStyle: 'solid',
							borderColor: 'border.button',
							focusVisibleRing: 'none',
							_focus: storefrontInputFocusStyles,
							_focusVisible: storefrontInputFocusStyles,
						},
						flushed: {
							...chakraDefaultRecipes.textarea.variants!.variant.flushed,
							focusVisibleRing: 'none',
							_focus: storefrontFlushedInputFocusStyles,
							_focusVisible: storefrontFlushedInputFocusStyles,
						},
					},
				},
			}),
		},
		slotRecipes: {
			checkbox: defineSlotRecipe({
				...chakraDefaultSlotRecipes.checkbox,
				base: {
					...chakraDefaultSlotRecipes.checkbox.base,
					control: {
						...chakraDefaultSlotRecipes.checkbox.base?.control,
						'&[data-state="unchecked"]': {
							borderColor: 'fg',
						},
						'&:is([data-state="checked"], [data-state="indeterminate"])': {
							bg: { base: 'black', _dark: 'white' },
							color: { base: 'white', _dark: 'black' },
							borderColor: { base: 'black', _dark: 'white' },
						},
					},
				},
			}),
			checkboxCard: defineSlotRecipe({
				...chakraDefaultSlotRecipes.checkboxCard,
				base: {
					...chakraDefaultSlotRecipes.checkboxCard.base,
					indicator: {
						...chakraDefaultSlotRecipes.checkboxCard.base?.indicator,
						'&[data-state="unchecked"]': {
							borderColor: 'fg',
						},
						'&:is([data-state="checked"], [data-state="indeterminate"])': {
							bg: { base: 'black', _dark: 'white' },
							color: { base: 'white', _dark: 'black' },
							borderColor: { base: 'black', _dark: 'white' },
						},
					},
				},
			}),
			radioGroup: defineSlotRecipe({
				...chakraDefaultSlotRecipes.radioGroup,
				base: {
					...chakraDefaultSlotRecipes.radioGroup.base,
					itemControl: {
						...chakraDefaultSlotRecipes.radioGroup.base?.itemControl,
						'&[data-state="unchecked"]': {
							borderColor: 'fg',
						},
						'&[data-state="checked"]': {
							bg: { base: 'black', _dark: 'white' },
							color: { base: 'white', _dark: 'black' },
							borderColor: { base: 'black', _dark: 'white' },
						},
					},
				},
			}),
			radioCard: defineSlotRecipe({
				...chakraDefaultSlotRecipes.radioCard,
				base: {
					...chakraDefaultSlotRecipes.radioCard.base,
					itemIndicator: {
						...chakraDefaultSlotRecipes.radioCard.base?.itemIndicator,
						'&[data-state="unchecked"]': {
							borderColor: 'fg',
						},
						'&[data-state="checked"]': {
							bg: { base: 'black', _dark: 'white' },
							color: { base: 'white', _dark: 'black' },
							borderColor: { base: 'black', _dark: 'white' },
						},
					},
				},
			}),
			combobox: defineSlotRecipe({
				...chakraDefaultSlotRecipes.combobox,
				defaultVariants: {
					...chakraDefaultSlotRecipes.combobox.defaultVariants,
					variant: 'flushed',
				},
				variants: {
					...chakraDefaultSlotRecipes.combobox.variants,
					variant: {
						...chakraDefaultSlotRecipes.combobox.variants!.variant,
						subtle: {
							...chakraDefaultSlotRecipes.combobox.variants!.variant.subtle,
							input: {
								...chakraDefaultSlotRecipes.combobox.variants!.variant.subtle.input,
								bg: { base: 'transparent', _dark: 'bg.muted' },
								borderWidth: '0.5px',
								borderStyle: 'solid',
								borderColor: 'border.button',
								focusVisibleRing: 'none',
								_focus: storefrontInputFocusStyles,
								_focusVisible: storefrontInputFocusStyles,
							},
						},
						flushed: {
							...chakraDefaultSlotRecipes.combobox.variants!.variant.flushed,
							input: {
								...chakraDefaultSlotRecipes.combobox.variants!.variant.flushed.input,
								focusVisibleRing: 'none',
								_focus: storefrontFlushedInputFocusStyles,
								_focusVisible: storefrontFlushedInputFocusStyles,
							},
						},
					},
				},
			}),
			numberInput: defineSlotRecipe({
				...chakraDefaultSlotRecipes.numberInput,
				defaultVariants: {
					...chakraDefaultSlotRecipes.numberInput.defaultVariants,
					variant: 'flushed',
				},
				variants: {
					...chakraDefaultSlotRecipes.numberInput.variants,
					variant: {
						...chakraDefaultSlotRecipes.numberInput.variants!.variant,
						subtle: {
							...chakraDefaultSlotRecipes.numberInput.variants!.variant.subtle,
							input: {
								...chakraDefaultSlotRecipes.numberInput.variants!.variant.subtle.input,
								borderWidth: '0.5px',
								borderStyle: 'solid',
								borderColor: 'border.button',
								focusVisibleRing: 'none',
								_focus: storefrontInputFocusStyles,
								_focusVisible: storefrontInputFocusStyles,
							},
						},
						flushed: {
							...chakraDefaultSlotRecipes.numberInput.variants!.variant.flushed,
							input: {
								...chakraDefaultSlotRecipes.numberInput.variants!.variant.flushed.input,
								focusVisibleRing: 'none',
								_focus: storefrontFlushedInputFocusStyles,
								_focusVisible: storefrontFlushedInputFocusStyles,
							},
						},
					},
				},
			}),
			pinInput: defineSlotRecipe({
				...chakraDefaultSlotRecipes.pinInput,
				defaultVariants: {
					...chakraDefaultSlotRecipes.pinInput.defaultVariants,
					variant: 'flushed',
				},
				variants: {
					...chakraDefaultSlotRecipes.pinInput.variants,
					variant: {
						...chakraDefaultSlotRecipes.pinInput.variants!.variant,
						subtle: {
							...chakraDefaultSlotRecipes.pinInput.variants!.variant.subtle,
							input: {
								...chakraDefaultSlotRecipes.pinInput.variants!.variant.subtle.input,
								bg: { base: 'transparent', _dark: 'bg.muted' },
								borderWidth: '0.5px',
								borderStyle: 'solid',
								borderColor: 'border.button',
								focusVisibleRing: 'none',
								_focus: storefrontInputFocusStyles,
								_focusVisible: storefrontInputFocusStyles,
							},
						},
						flushed: {
							...chakraDefaultSlotRecipes.pinInput.variants!.variant.flushed,
							input: {
								...chakraDefaultSlotRecipes.pinInput.variants!.variant.flushed.input,
								focusVisibleRing: 'none',
								_focus: storefrontFlushedInputFocusStyles,
								_focusVisible: storefrontFlushedInputFocusStyles,
							},
						},
					},
				},
			}),
			select: defineSlotRecipe({
				...chakraDefaultSlotRecipes.select,
				defaultVariants: {
					...chakraDefaultSlotRecipes.select.defaultVariants,
					variant: 'subtle',
				},
				variants: {
					...chakraDefaultSlotRecipes.select.variants,
					variant: {
						...chakraDefaultSlotRecipes.select.variants!.variant,
						subtle: {
							...chakraDefaultSlotRecipes.select.variants!.variant.subtle,
							trigger: {
								...chakraDefaultSlotRecipes.select.variants!.variant.subtle.trigger,
								bg: { base: 'transparent', _dark: 'bg.muted' },
								borderWidth: '0.5px',
								borderStyle: 'solid',
								borderColor: 'border.button',
								focusVisibleRing: 'none',
								_focus: storefrontInputFocusStyles,
								_focusVisible: storefrontInputFocusStyles,
							},
						},
					},
				},
			}),
		},
	},
	globalCss: {
		'html, body': {
			margin: 0,
			padding: 0,
		},
		html: {
			fontSize: '16px',
			textSizeAdjust: '100%',
		},
		body: {
			display: 'flex',
			flexDirection: 'column',
			minWidth: '350px',
			fontFamily: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
			fontWeight: 500,
			textRendering: 'optimizeLegibility',
			userSelect: 'none',
		},
		img: { userSelect: 'none' },
		form: {
			width: '100%',
		},
		svg: {
			display: 'inline',
		},
		'a, a > span, button.chakra-tabs__trigger': {
			fontFamily:
				'"Open Sans", "Open Sans Fallback", "Segoe UI", "Helvetica Neue", Arial, sans-serif !important',
			fontWeight: 500,
			fontSize: 16,
		},
		'h1,h2,h3,h4,h5,h6, .chakra-heading': {
			fontFamily:
				'"Open Sans", "Open Sans Fallback", "Segoe UI", "Helvetica Neue", Arial, sans-serif !important',
			fontWeight: 500,
			userSelect: 'none',
		},
		'p, span, li': {
			fontFamily: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
			fontWeight: 500,
			userSelect: 'none',
		},
		'.chakra-stat__valueText': {
			fontFamily: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
			userSelect: 'none',
		},
		'label, button, input, textarea, select, small': {
			fontFamily: 'var(--font-open-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
			fontWeight: 500,
		},
		'input, textarea, select, [contenteditable="true"]': {
			userSelect: 'text',
		},
		'.swiper-button-prev,.swiper-button-next': {
			color: 'var(--chakra-colors-fg) !important',
		},
		'.thumbsSlider .swiper-button-prev:after, .thumbsSlider .swiper-button-next:after, .imageModalSwiper .swiper-button-prev:after, .imageModalSwiper .swiper-button-next:after':
			{
				color: 'var(--chakra-colors-bg-inverted) !important',
				fontSize: '22px !important',
				backgroundColor: 'transparent',
				padding: '8px',
				borderRadius: '60%',
			},
		'.thumbsSlider .swiper-button-prev, .thumbsSlider .swiper-button-next, .imageModalSwiper .swiper-button-prev, .imageModalSwiper .swiper-button-next':
			{
				backgroundColor: 'bg.tertiary',
				borderWidth: '0.5px',
				borderRadius: 'sm',
				borderColor: 'var(--chakra-colors-border)',
				height: '78px !important',
				width: '24px !important',
			},
		'.thumbsSlider .swiper-button-prev .swiper-navigation-icon, .thumbsSlider .swiper-button-next .swiper-navigation-icon, .imageModalSwiper .swiper-button-prev .swiper-navigation-icon, .imageModalSwiper .swiper-button-next .swiper-navigation-icon':
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
		// '.chakra-radio-group__item > span:first-of-type:not(.chakra-radio-group__itemText)[data-state="unchecked"]':
		// 	{
		// 		color: 'var(--chakra-colors-fg) !important',
		// 	},
		// '.chakra-checkbox__control[data-state="unchecked"]': {
		// 	color: 'var(--chakra-colors-fg) !important',
		// },
		'.thumbsSlider .swiper-pagination-bullet, .thumbsSlider-pagination .swiper-pagination-bullet': {
			width: '20px !important',
			height: '20px !important',
			textAlign: 'center !important',
			lineHeight: '20px !important',
			fontSize: '15px !important',
			color: 'black !important',
			backgroundColor: 'white !important',
			opacity: '.8 !important',
			margin: '0 6px !important',
			'@media screen and (max-width: 767px)': {
				width: '28px !important',
				height: '28px !important',
				lineHeight: '28px !important',
				fontSize: '15px !important',
				margin: '0 8px !important',
			},
		},
		'.thumbsSlider .swiper-pagination-bullet-active, .thumbsSlider-pagination .swiper-pagination-bullet-active':
			{
				backgroundColor: 'var(--chakra-colors-main-accent) !important',
				opacity: '1 !important',
			},
		'.thumbsSlider .swiper-button-prev:focus-visible, .thumbsSlider .swiper-button-next:focus-visible, .thumbsSlider .swiper-pagination-bullet:focus-visible, .imageModalSwiper .swiper-button-prev:focus-visible, .imageModalSwiper .swiper-button-next:focus-visible':
			{
				outline: '2px solid var(--chakra-colors-main-accent)',
				outlineOffset: '4px',
			},
		'.thumbsSlider .swiper-pagination': {
			bottom: '0 !important',
			marginBottom: '12px',
		},
		'.thumbsSlider-pagination': {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: '12px',
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
