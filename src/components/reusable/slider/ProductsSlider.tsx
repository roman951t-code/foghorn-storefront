'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { HStack } from '@chakra-ui/react';
import LoadingSkeleton from '../Skeleton';
import ProductCard from '../cards/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

const breakpoints = {
	430: {
		slidesPerView: 2,
	},
	630: {
		slidesPerView: 3,
	},
	840: {
		slidesPerView: 4,
	},
	1120: {
		slidesPerView: 5,
	},
	1220: {
		slidesPerView: 6,
	},
};

export default function ProductsSlider() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<HStack gap='4' mt='8' justifyContent='space-between' overflow='hidden'>
				<LoadingSkeleton />
				<LoadingSkeleton />
				<LoadingSkeleton />
				<LoadingSkeleton />
			</HStack>
		);
	}

	return (
		<Swiper
			loop
			navigation
			breakpoints={breakpoints}
			slidesPerView={1}
			spaceBetween={8}
			modules={[Navigation]}
			className='productsSlider'
		>
			{Array.from({ length: 12 }).map((_, index) => (
				<SwiperSlide key={index}>
					<ProductCard />
				</SwiperSlide>
			))}
		</Swiper>
	);
}
