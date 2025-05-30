'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import Image from 'next/image';
import ImageModal from './ImageModal';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import '@/styles/swiper.css';

import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';

const images = [
	'/assets/images/temp/1Big.webp',
	'/assets/images/temp/2Big.webp',
	'/assets/images/temp/3Big.webp',
	'/assets/images/temp/4Big.webp',
];

export default function ProductThumbsSlider() {
	const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
	const isSmallScreen = useBreakpointValue({ base: true, md: false });
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const pagination = isSmallScreen
		? {
				clickable: true,
				renderBullet: function (index: number, className: string) {
					return `<span class="${className}">${index + 1}</span>`;
				},
		  }
		: false;

	const resetImage = () => {
		setSelectedImage(null);
	};

	return (
		<>
			{/* Main Image Slider */}
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
					loop={true}
					spaceBetween={4}
					slidesPerView={4}
					freeMode={true}
					watchSlidesProgress={true}
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

			{/* Fullscreen Modal Viewer */}
			<ImageModal image={selectedImage} resetModal={resetImage} />
		</>
	);
}
