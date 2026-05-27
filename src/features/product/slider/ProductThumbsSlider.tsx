'use client';

import dynamic from 'next/dynamic';
import { Box, HStack, Skeleton, useBreakpointValue } from '@chakra-ui/react';
import { KeyboardEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination, A11y, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/utils/productImages';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

const ImageModal = dynamic(() => import('./ImageModal'));

type ProductThumbsSliderProps = {
	images: string[];
	productName?: string;
	initialIndex?: number;
};

function ThumbsSliderSkeleton() {
	const isSmallScreen = useBreakpointValue({ base: true, sm: false });

	const skeletonCount = isSmallScreen ? 1 : 4;

	return (
		<>
			<Skeleton width='100%' aspectRatio={1} />
			{!isSmallScreen && (
				<HStack mt={4} p={4}>
					{Array.from({ length: skeletonCount }).map((_, i) => (
						<Skeleton key={i} height='100px' width='100%' flex='1' />
					))}
				</HStack>
			)}
		</>
	);
}

const DynamicProductThumbsSlider = dynamic(() => Promise.resolve(ThumbsSliderInternal), {
	ssr: false,
	loading: () => <ThumbsSliderSkeleton />,
});

export default function ProductThumbsSlider(props: ProductThumbsSliderProps) {
	return <DynamicProductThumbsSlider {...props} />;
}

function ThumbsSliderInternal({ images, productName, initialIndex = 0 }: ProductThumbsSliderProps) {
	const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
	const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
	const isSmallScreen = useBreakpointValue({ base: true, sm: false });
	const thumbInstance =
		!isSmallScreen && thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null;
	const accessibleName = productName ?? 'product';

	const normalizedImages = images.filter((src): src is string => src.trim().length > 0);
	const galleryImages = normalizedImages.length
		? normalizedImages
		: Array.from({ length: 4 }, () => PRODUCT_PLACEHOLDER_IMAGE);
	const gallerySignature = galleryImages.join('|');
	const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

	useEffect(() => {
		setFailedIndexes(new Set());
	}, [gallerySignature]);

	const markImageFailed = (index: number) => () => {
		setFailedIndexes((prev) => {
			if (prev.has(index)) return prev;
			const next = new Set(prev);
			next.add(index);
			return next;
		});
	};

	const resolvedGalleryImages = galleryImages.map((src, index) =>
		failedIndexes.has(index) ? PRODUCT_PLACEHOLDER_IMAGE : src,
	);
	const normalizedInitialIndex = Number.isFinite(initialIndex)
		? Math.max(0, Math.floor(initialIndex))
		: 0;
	const safeInitialIndex = Math.min(
		normalizedInitialIndex,
		Math.max(0, resolvedGalleryImages.length - 1),
	);

	useEffect(() => {
		if (!mainSwiper || mainSwiper.destroyed) return;
		mainSwiper.slideToLoop(safeInitialIndex, 0);
	}, [mainSwiper, safeInitialIndex, gallerySignature]);

	useEffect(() => {
		if (!thumbInstance || thumbInstance.destroyed) return;
		thumbInstance.slideToLoop(safeInitialIndex, 0);
	}, [thumbInstance, safeInitialIndex, gallerySignature]);

	const pagination = isSmallScreen
		? {
				clickable: true,
				renderBullet: function (index: number, className: string) {
					return `<span class="${className}" style="margin: 0 6px;">${index + 1}</span>`;
				},
			}
		: false;

	const resetImage = () => setSelectedImageIndex(null);
	const openImage = (fallbackIndex?: number) => {
		const currentIndex = mainSwiper?.realIndex ?? fallbackIndex ?? 0;
		const boundedIndex = Math.min(
			Math.max(currentIndex, 0),
			Math.max(0, resolvedGalleryImages.length - 1),
		);
		setSelectedImageIndex(boundedIndex);
	};
	const handleSlideKeyOpen = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openImage();
		}
	};

	return (
		<>
			<Swiper
				onSwiper={(swiper) => setMainSwiper(swiper)}
				initialSlide={safeInitialIndex}
				loop
				zoom
				navigation
				spaceBetween={0}
				pagination={pagination}
				keyboard={{ enabled: true, onlyInViewport: true }}
				thumbs={{ swiper: thumbInstance ?? undefined }}
				a11y={{
					enabled: true,
					containerMessage: `Image gallery for ${accessibleName}`,
					containerRoleDescriptionMessage: 'Product media carousel',
					itemRoleDescriptionMessage: 'Slide',
					slideLabelMessage: 'Image {{index}} of {{slidesLength}}',
					prevSlideMessage: 'Previous product image',
					nextSlideMessage: 'Next product image',
					paginationBulletMessage: 'Go to product image {{index}}',
				}}
				modules={[FreeMode, Navigation, Thumbs, Pagination, A11y, Keyboard]}
				className='thumbsSlider'
				aria-label={`Image gallery for ${accessibleName}`}
			>
				{resolvedGalleryImages.map((src, index) => {
					const isFirst = index === 0;
					return (
						<SwiperSlide
							key={index}
							onClick={() => openImage(index)}
							role='button'
							tabIndex={0}
							onKeyDown={handleSlideKeyOpen}
							aria-label={`Open larger view of ${accessibleName} image ${index + 1}`}
						>
							<Box
								position='relative'
								width='100%'
								aspectRatio={1}
								cursor='pointer'
								overflow='hidden'
								rounded='lg'
							>
								<Image
									src={src}
									alt={`${accessibleName} photo ${index + 1}`}
									onError={markImageFailed(index)}
									fill
									priority={isFirst}
									fetchPriority={isFirst ? 'high' : undefined}
									quality={68}
									style={{ objectFit: 'cover' }}
									sizes='(max-width: 900px) 100vw, (max-width: 1199px) 828px, 690px'
									draggable={false}
								/>
							</Box>
						</SwiperSlide>
					);
				})}
			</Swiper>

			<Box hideBelow='sm' mt={4}>
				<Swiper
					onSwiper={(swiper) => setThumbsSwiper(swiper)}
					loop
					spaceBetween={4}
					slidesPerView={4}
					freeMode
					watchSlidesProgress
					modules={[FreeMode, Navigation, A11y]}
					className='thumbsSlider2'
					a11y={{
						enabled: true,
						containerMessage: `Thumbnail carousel for ${accessibleName}`,
						itemRoleDescriptionMessage: 'Thumbnail',
						slideLabelMessage: 'Thumbnail {{index}} of {{slidesLength}}',
						prevSlideMessage: 'Previous thumbnail',
						nextSlideMessage: 'Next thumbnail',
					}}
					aria-label={`Thumbnail carousel for ${accessibleName}`}
				>
					{resolvedGalleryImages.map((src, index) => (
						<SwiperSlide
							key={index}
							role='button'
							tabIndex={0}
							aria-label={`View ${accessibleName} image ${index + 1}`}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									thumbInstance?.slideToLoop(index);
								}
							}}
						>
							<Box
								position='relative'
								width='100%'
								maxW='98px'
								aspectRatio={1}
								mx='auto'
								cursor='pointer'
								overflow='hidden'
								rounded='sm'
							>
								<Image
									src={src}
									alt={`${accessibleName} thumbnail ${index + 1}`}
									onError={markImageFailed(index)}
									fill
									style={{
										objectFit: 'cover',
									}}
									sizes='72px'
									draggable={false}
								/>
							</Box>
						</SwiperSlide>
					))}
				</Swiper>
			</Box>

			<ImageModal
				images={resolvedGalleryImages}
				initialIndex={selectedImageIndex}
				productName={accessibleName}
				resetModal={resetImage}
			/>
		</>
	);
}
