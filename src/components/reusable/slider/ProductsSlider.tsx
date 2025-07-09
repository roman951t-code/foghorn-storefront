'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { HStack } from '@chakra-ui/react';
import { LoadingSkeleton } from '../Skeleton';
import ProductCard from '../cards/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { productsBreakpoints } from '@/data/breakpoints';

export default function ProductsSlider() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<HStack gap='4' mt='8' overflowX='auto'>
				{Array.from({ length: 2 }).map((_, i) => (
					<LoadingSkeleton key={i} />
				))}
			</HStack>
		);
	}

	return (
		<Swiper
			loop
			navigation
			breakpoints={productsBreakpoints}
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
