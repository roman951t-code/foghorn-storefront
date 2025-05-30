'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
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
	830: {
		slidesPerView: 4,
	},
	1030: {
		slidesPerView: 5,
	},
};

export default function ProductsSlider() {
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
