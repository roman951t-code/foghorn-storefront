'use client';

import dynamic from 'next/dynamic';
import { Box, HStack, Skeleton, useBreakpointValue } from '@chakra-ui/react';
import { KeyboardEvent, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination, A11y, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/utils/productImages';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

const ImageModal = dynamic(() => import('./ImageModal'));

type ProductThumbsSliderProps = {
	images: string[];
	productName?: string;
};

function ThumbsSliderSkeleton() {
	const isSmallScreen = useBreakpointValue({ base: true, md: false });

	const skeletonCount = isSmallScreen ? 1 : 4;

	return (
		<>
			<Skeleton height={{ base: '400px', md: '700px' }} width='100%' />
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

function ThumbsSliderInternal({ images, productName }: ProductThumbsSliderProps) {
	const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
	const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const isSmallScreen = useBreakpointValue({ base: true, md: false });
	const thumbInstance =
		!isSmallScreen && thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null;
	const accessibleName = productName ?? 'product';

	const galleryImages = images.length
		? images
		: Array.from({ length: 4 }, () => PRODUCT_PLACEHOLDER_IMAGE);

	const pagination = isSmallScreen
		? {
				clickable: true,
				renderBullet: function (index: number, className: string) {
					return `<span class="${className}" style="margin: 0 6px;">${index + 1}</span>`;
				},
		  }
		: false;

	const resetImage = () => setSelectedImage(null);
	const openImage = (fallbackIndex?: number) => {
		const currentIndex = mainSwiper?.realIndex ?? fallbackIndex ?? 0;
		setSelectedImage(galleryImages[currentIndex] ?? null);
	};
	const handleSlideKeyOpen = (src: string) => (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openImage();
		}
	};

	return (
		<>
			<Swiper
				onSwiper={(swiper) => setMainSwiper(swiper)}
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
				{galleryImages.map((src, index) => {
					const isFirst = index === 0;
					return (
						<SwiperSlide
							key={index}
							onClick={() => openImage(index)}
							role='button'
							tabIndex={0}
							onKeyDown={handleSlideKeyOpen(src)}
							aria-label={`Open larger view of ${accessibleName} image ${index + 1}`}
						>
							<Box
								position='relative'
								width='100%'
								height={{ base: '400px', md: '700px' }}
								cursor='pointer'
								overflow='hidden'
								rounded='lg'
							>
								<Image
									src={src}
									alt={`${accessibleName} photo ${index + 1}`}
									fill
									priority={isFirst}
									fetchPriority={isFirst ? 'high' : undefined}
									quality={68}
									style={{ objectFit: 'cover' }}
									sizes='(max-width: 768px) 100vw, 50vw'
									draggable={false}
								/>
							</Box>
						</SwiperSlide>
					);
				})}
			</Swiper>

			<Box hideBelow='md' mt={4}>
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
					{galleryImages.map((src, index) => (
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
							<Box position='relative' width='94%' height='90px' cursor='pointer' overflow='hidden'>
								<Image
									src={src}
									alt={`${accessibleName} thumbnail ${index + 1}`}
									fill
									style={{
										objectFit: 'cover',
										borderRadius: '4px',
									}}
									sizes='(max-width: 768px) 25vw, 10vw'
									draggable={false}
								/>
							</Box>
						</SwiperSlide>
					))}
				</Swiper>
			</Box>

			<ImageModal image={selectedImage} resetModal={resetImage} />
		</>
	);
}
