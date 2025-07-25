'use client';

import dynamic from 'next/dynamic';
import { HStack } from '@chakra-ui/react';
import { LoadingSkeleton } from '../Skeleton';
import ProductCard from '../cards/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

import { productsBreakpoints } from '@/data/breakpoints';

function ProductsSkeletonFallback() {
	return (
		<HStack gap='4' mt='8' overflowX='auto'>
			{Array.from({ length: 2 }).map((_, i) => (
				<LoadingSkeleton key={i} />
			))}
		</HStack>
	);
}

function ProductsSwiper() {
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

const DynamicProductsSwiper = dynamic(() => Promise.resolve(ProductsSwiper), {
	ssr: false,
	loading: () => <ProductsSkeletonFallback />,
});

export default function ProductsSlider() {
	return <DynamicProductsSwiper />;
}
