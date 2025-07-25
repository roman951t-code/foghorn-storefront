'use client';

import dynamic from 'next/dynamic';
import { Box, HStack, Skeleton, useBreakpointValue } from '@chakra-ui/react';
import React, { useState } from 'react';
import Image from 'next/image';

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

export default function ProductThumbsSlider() {
	return <DynamicProductThumbsSlider />;
}

function ThumbsSliderInternal() {
	const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const isSmallScreen = useBreakpointValue({ base: true, md: false });

	const images = [
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

	const { Swiper, SwiperSlide } = require('swiper/react');
	const { FreeMode, Navigation, Thumbs, Pagination } = require('swiper/modules');

	require('swiper/css');
	require('swiper/css/free-mode');
	require('swiper/css/navigation');
	require('swiper/css/thumbs');
	require('swiper/css/pagination');

	return (
		<>
			<Swiper
				loop
				zoom
				navigation
				spaceBetween={0}
				pagination={pagination}
				thumbs={{ swiper: thumbsSwiper }}
				modules={[FreeMode, Navigation, Thumbs, Pagination]}
				className='thumbsSlider'
			>
				{images.map((src, index) => (
					<SwiperSlide key={index} onClick={() => setSelectedImage(src)}>
						<Box
							position='relative'
							width='100%'
							height={{ base: '400px', md: '700px' }}
							cursor='pointer'
						>
							<Image
								src={src}
								alt={`Product photo ${index + 1}`}
								fill
								style={{ objectFit: 'contain' }}
								sizes='(max-width: 768px) 100vw, 50vw'
							/>
						</Box>
					</SwiperSlide>
				))}
			</Swiper>

			<Box hideBelow='md' mt={4}>
				<Swiper
					onSwiper={setThumbsSwiper}
					loop
					spaceBetween={4}
					slidesPerView={4}
					freeMode
					watchSlidesProgress
					modules={[FreeMode, Navigation, Thumbs]}
					className='thumbsSlider2'
				>
					{images.map((src, index) => (
						<SwiperSlide key={index}>
							<Box position='relative' width='100%' height='100px' cursor='pointer'>
								<Image
									src={src}
									alt={`Product thumbnail ${index + 1}`}
									fill
									style={{ objectFit: 'contain' }}
									sizes='(max-width: 768px) 25vw, 10vw'
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
