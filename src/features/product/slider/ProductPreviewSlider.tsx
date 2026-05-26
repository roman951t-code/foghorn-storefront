'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { PRODUCT_PLACEHOLDER_IMAGE, toPreviewImage } from '@/utils/productImages';

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

	return (
		<Swiper
			navigation
			loop
			modules={[Navigation]}
			className='productPreviewSwiper'
			style={{ width: '100%', height: '100%' }}
			onSwiper={(swiper) => onActiveIndexChange?.(swiper.realIndex ?? 0)}
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
							border='none'
							borderRadius='sm'
							overflow='hidden'
							display='block'
							w='full'
							h='full'
							bg='white'
						>
							<Image
								loading={shouldPrioritize ? 'eager' : 'lazy'}
								src={resolvedSrc}
								width={240}
								height={220}
								alt={altText}
								onError={markImageFailed(i)}
								priority={shouldPrioritize}
								fetchPriority={shouldPrioritize ? 'high' : 'auto'}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}}
								sizes='(max-width: 560px) 60vw, (max-width: 800px) 32vw, (max-width: 1080px) 22vw, (max-width: 1360px) 160px, 148px'
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
		<Box
			position='relative'
			w={{ base: 'min(60vw, 196px)', sm: '164px', md: '156px', xl: '148px' }}
			aspectRatio='1 / 1'
			display='block'
			mx='auto'
		>
			<Box
				as='div'
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'main.secondary',
					outlineOffset: '2px',
				}}
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				borderRadius='sm'
				overflow='hidden'
				display='block'
				w='full'
				h='full'
				bg='white'
				aria-hidden='true'
			>
				<Image
					src={firstPreview}
					width={240}
					height={220}
					alt={altText}
					priority={shouldPrioritize}
					loading={shouldPrioritize ? 'eager' : 'lazy'}
					fetchPriority={shouldPrioritize ? 'high' : 'auto'}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
					sizes='(max-width: 560px) 60vw, (max-width: 800px) 32vw, (max-width: 1080px) 22vw, (max-width: 1360px) 160px, 148px'
				/>
			</Box>
			<Box position='absolute' inset='0' zIndex={1}>
				<DynamicProductPreviewSlider {...props} />
			</Box>
		</Box>
	);
}
