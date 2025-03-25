'use client';

import { useState, useEffect } from 'react';
import { Image, Flex } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
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
					<Image
						key={index}
						maxWidth='479px'
						h='500px'
						rounded='md'
						src={src}
						alt={`Carousel ${index + 1}`}
					/>
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
					<Image w='479px' h='500px' rounded='md' src={src} alt={`Carousel ${index + 1}`} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}
