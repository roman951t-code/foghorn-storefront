'use client';

import dynamic from 'next/dynamic';
import { Box, HStack, Skeleton, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

const ImageModal = dynamic(() => import('./ImageModal'));

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

export default function ProductThumbsSlider({ images }: { images: string[] }) {
	return <DynamicProductThumbsSlider images={images} />;
}

function ThumbsSliderInternal({ images }: { images: string[] }) {
	const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const isSmallScreen = useBreakpointValue({ base: true, md: false });

	const galleryImages = images.length
		? images
		: [
				'/assets/images/temp/1Big.webp',
				'/assets/images/temp/2Big.webp',
				'/assets/images/temp/3Big.webp',
				'/assets/images/temp/4Big.webp',
		  ];

	const pagination = isSmallScreen
		? {
				clickable: true,
				renderBullet: function (index: number, className: string) {
					return `<span class="${className}">${index + 1}</span>`;
				},
		  }
		: false;

	const resetImage = () => setSelectedImage(null);

	return (
		<>
			<Swiper
				loop
				zoom
				navigation
				spaceBetween={0}
				pagination={pagination}
				thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
				modules={[FreeMode, Navigation, Thumbs, Pagination]}
				className='thumbsSlider'
			>
				{galleryImages.map((src, index) => (
					<SwiperSlide key={index} onClick={() => setSelectedImage(src)}>
						<Box
							position='relative'
							width='100%'
							height={{ base: '400px', md: '700px' }}
							cursor='pointer'
							userSelect='none'
							overflow='hidden'
							rounded='sm'
						>
							<Image
								src={src}
								alt={`Product photo ${index + 1}`}
								fill
								style={{ objectFit: 'contain' }}
								sizes='(max-width: 768px) 100vw, 50vw'
								draggable={false}
							/>
						</Box>
					</SwiperSlide>
				))}
			</Swiper>

			<Box hideBelow='md' mt={4}>
				<Swiper
					onSwiper={(swiper) => setThumbsSwiper(swiper)}
					loop
					spaceBetween={4}
					slidesPerView={4}
					freeMode
					watchSlidesProgress
					modules={[FreeMode, Navigation, Thumbs]}
					className='thumbsSlider2'
					style={{ userSelect: 'none' }}
				>
					{galleryImages.map((src, index) => (
						<SwiperSlide key={index}>
							<Box
								position='relative'
								width='94%'
								height='90px'
								cursor='pointer'
								userSelect='none'
								overflow='hidden'
							>
								<Image
									src={src}
									alt={`Product thumbnail ${index + 1}`}
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
