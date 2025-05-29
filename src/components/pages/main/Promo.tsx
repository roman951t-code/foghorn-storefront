'use client';

import { useState, useEffect } from 'react';
import { Flex, Image } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import NextImage from 'next/image';

import 'swiper/css';
import '@/styles/swiper.css';

const carousel1 = '/assets/images/carousel1.webp';
const carousel2 = '/assets/images/carousel2.webp';

const images = [carousel1, carousel2, carousel1];

const breakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1000: { slidesPerView: 2 },
};

export default function Promo() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<Flex
				gap={4}
				w={{ base: '100%', md: '75%' }}
				overflow='hidden'
				wrap='nowrap'
				alignItems={'center'}
			>
				{images.map((src, index) => (
					<Image asChild key={index} h='500px' position='relative' maxW='479px' borderRadius='2'>
						<NextImage src={src} alt={`Carousel ${index + 1}`} fill />
					</Image>
				))}
			</Flex>
		);
	}

	return (
		<Swiper
			slidesPerView={1}
			spaceBetween={10}
			loop
			breakpoints={breakpoints}
			modules={[Autoplay]}
			className='promoSlider'
		>
			{images.map((src, index) => (
				<SwiperSlide key={index}>
					<Flex position='relative' height='500px' width='100%'>
						<NextImage
							src={src}
							alt={`Carousel ${index + 1}`}
							fill
							sizes='(max-width: 768px) 100vw, 480px'
							style={{ objectFit: 'cover', borderRadius: '8px' }}
						/>
					</Flex>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
