'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Image, Box, useBreakpointValue } from '@chakra-ui/react';
import NextImage from 'next/image';
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
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
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
						<Image asChild cursor='pointer'>
							<NextImage src={src} alt={`Product photo ${index + 1}`} />
						</Image>
					</SwiperSlide>
				))}
			</Swiper>

			<Box hideBelow='md'>
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
							<Image asChild cursor='pointer'>
								<NextImage src={src} alt={`Product photo ${index + 1}`} />
							</Image>
						</SwiperSlide>
					))}
				</Swiper>
			</Box>
			<ImageModal image={selectedImage} resetModal={resetImage} />
		</>
	);
}
