'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { PRODUCT_PLACEHOLDER_IMAGE, toPreviewImage } from '@/utils/productImages';
import { shouldBypassImageOptimization } from '@/utils/imageOptimization';
import { PRODUCTS_GRID_CARD_MAX_WIDTH_PX } from '@/constants/grids';

// This slider renders inside every product card, including the widest one
// (PRODUCTS_GRID_CSS's card band and the matching ProductsSlider phone
// layout), so these hints have to match those cards' actual rendered width
// or the browser fetches a too-small srcset candidate and upscales (blurs)
// it. Below `cardSm` (533px) the card is full-width (see PRODUCTS_GRID_CSS's
// single-column tier and ProductsSlider's uncapped phone width), so the
// image is ~100vw minus the page's 24px side margin. Above that, column
// count varies by page/breakpoint (2 to 4 columns depending on grid and
// sidebar state — see grids.ts), so 48vw/32vw are deliberately generous
// upper-bound estimates rather than an exact per-tier match: over-fetching
// a bit is harmless, under-fetching blurs the image.
const PRODUCT_IMAGE_SIZES = `(max-width: 532px) calc(100vw - 24px), (max-width: 1096px) 48vw, (max-width: 1344px) 32vw, (max-width: 1360px) ${PRODUCTS_GRID_CARD_MAX_WIDTH_PX}px, ${PRODUCTS_GRID_CARD_MAX_WIDTH_PX}px`;

type ProductPreviewSliderProps = {
	images: string[];
	productName?: string;
	imagePriority?: boolean;
	onActiveIndexChange?: (index: number) => void;
};

function ProductPreviewSwiper({
	images,
	productName,
	imagePriority = true,
	onActiveIndexChange,
}: ProductPreviewSliderProps) {
	const normalizedImages = images.filter((src): src is string => src.trim().length > 0);
	const baseImages = normalizedImages.length
		? normalizedImages
		: [PRODUCT_PLACEHOLDER_IMAGE, PRODUCT_PLACEHOLDER_IMAGE];
	const previewImages = baseImages.map(toPreviewImage);
	const previewSignature = previewImages.join('|');
	const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

	useEffect(() => {
		setFailedIndexes(new Set());
	}, [previewSignature]);

	useEffect(() => {
		onActiveIndexChange?.(0);
	}, [onActiveIndexChange, previewSignature]);

	const markImageFailed = (index: number) => () => {
		setFailedIndexes((prev) => {
			if (prev.has(index)) return prev;
			const next = new Set(prev);
			next.add(index);
			return next;
		});
	};
	const altText = productName ? `${productName} photo` : 'Product photo';
	// Loop mode needs more than one real slide to loop through — with exactly
	// one, Swiper's own DOM manipulation can end up in a state React's
	// reconciliation can't patch (observed in production as an insertBefore
	// HierarchyRequestError, on subcategory pages where this renders once per
	// product card). See ProductsSlider.tsx for the fuller writeup.
	const canLoop = previewImages.length > 1;

	// Something in the page's global CSS cascade sets `color` on these arrows
	// with `!important` (confirmed: a plain, non-important inline style still
	// lost to it), so the fix has to fight back with `!important` too rather
	// than relying on swiper.css's --swiper-navigation-color variable. White
	// icons on the dark, semi-opaque circle from swiper.css so they read the
	// same way over any photo, in both light and dark theme.
	const paintNavArrowsWhite = (swiper: {
		navigation?: { nextEl?: HTMLElement; prevEl?: HTMLElement };
	}) => {
		const { nextEl, prevEl } = swiper.navigation ?? {};
		nextEl?.style.setProperty('color', '#fff', 'important');
		prevEl?.style.setProperty('color', '#fff', 'important');
	};

	return (
		<Swiper
			navigation
			loop={canLoop}
			loopAddBlankSlides={false}
			grabCursor
			modules={[Navigation]}
			className='productPreviewSwiper'
			style={{ width: '100%', height: '100%' }}
			onSwiper={(swiper) => {
				onActiveIndexChange?.(swiper.realIndex ?? 0);
				paintNavArrowsWhite(swiper);
			}}
			onSlideChange={(swiper) => onActiveIndexChange?.(swiper.realIndex ?? 0)}
		>
			{previewImages.map((src, i) => {
				const resolvedSrc = failedIndexes.has(i) ? PRODUCT_PLACEHOLDER_IMAGE : src;
				const shouldPrioritize = imagePriority && i === 0;
				return (
					<SwiperSlide key={i}>
						<Box
							as='div'
							_focusVisible={{
								outline: '2px solid',
								outlineColor: 'main.secondary',
								outlineOffset: '2px',
							}}
							overflow='hidden'
							display='block'
							w='full'
							h='full'
						>
							<Image
								loading={shouldPrioritize ? 'eager' : 'lazy'}
								src={resolvedSrc}
								unoptimized={shouldBypassImageOptimization(resolvedSrc)}
								width={480}
								height={440}
								alt={altText}
								onError={markImageFailed(i)}
								priority={shouldPrioritize}
								fetchPriority={shouldPrioritize ? 'high' : 'auto'}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
								sizes={PRODUCT_IMAGE_SIZES}
							/>
						</Box>
					</SwiperSlide>
				);
			})}
		</Swiper>
	);
}

const DynamicProductPreviewSlider = dynamic(() => Promise.resolve(ProductPreviewSwiper), {
	ssr: false,
	loading: () => null,
});

export default function ProductPreviewSlider(props: ProductPreviewSliderProps) {
	const normalizedImages = props.images.filter((src): src is string => src.trim().length > 0);
	const firstPreview = toPreviewImage(normalizedImages[0] ?? PRODUCT_PLACEHOLDER_IMAGE);
	const altText = props.productName ? `${props.productName} photo` : 'Product photo';
	const shouldPrioritize = props.imagePriority ?? false;

	return (
		<Box position='relative' w='full' aspectRatio='240 / 220' display='block'>
			<Box
				as='div'
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'main.secondary',
					outlineOffset: '2px',
				}}
				display='block'
				w='full'
				h='full'
				aria-hidden='true'
			>
				<Image
					src={firstPreview}
					unoptimized={shouldBypassImageOptimization(firstPreview)}
					width={480}
					height={440}
					alt={altText}
					priority={shouldPrioritize}
					loading={shouldPrioritize ? 'eager' : 'lazy'}
					fetchPriority={shouldPrioritize ? 'high' : 'auto'}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
					sizes={PRODUCT_IMAGE_SIZES}
				/>
			</Box>
			<Box position='absolute' inset='0' zIndex={1}>
				<DynamicProductPreviewSlider {...props} />
			</Box>
		</Box>
	);
}
