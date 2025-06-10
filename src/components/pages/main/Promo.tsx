'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, HStack } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import NextImage from 'next/image';
import LoadingSkeleton from '@/components/reusable/Skeleton';

import 'swiper/css';

const carousel1 = '/assets/images/carousel1.webp';
const carousel2 = '/assets/images/carousel2.webp';

const images = [carousel1, carousel2, carousel1, carousel2];

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
			<HStack gap='4' px='4' justifyContent='space-between' overflow='hidden'>
				<LoadingSkeleton />
				<LoadingSkeleton />
				<LoadingSkeleton />
			</HStack>
		);
	}

	return (
		<Swiper
			loop={true}
			// autoplay={{ delay: 3000 }}
			spaceBetween={10}
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
