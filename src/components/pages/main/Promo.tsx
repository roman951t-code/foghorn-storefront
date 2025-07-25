'use client';

import dynamic from 'next/dynamic';
import { Flex, HStack, useBreakpointValue } from '@chakra-ui/react';
import { LoadingPromoSkeleton } from '@/components/reusable/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import NextImage from 'next/image';

import 'swiper/css';

const carousel1 = '/assets/images/carousel1.webp';
const carousel2 = '/assets/images/carousel2.webp';

const images = [carousel1, carousel2, carousel1, carousel2];

const breakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
};

function PromoSkeletonFallback() {
	const skeletonCount = useBreakpointValue({ base: 1, sm: 2, md: 1, lg: 2 }) ?? 4;

	return (
		<HStack gap='4' mt='8' overflowX='auto' overflowY='hidden' w='100%'>
			{Array.from({ length: skeletonCount }).map((_, i) => (
				<LoadingPromoSkeleton key={i} />
			))}
		</HStack>
	);
}

function PromoSlider() {
	return (
		<Swiper
			loop
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

const DynamicPromoSlider = dynamic(() => Promise.resolve(PromoSlider), {
	ssr: false,
	loading: () => <PromoSkeletonFallback />,
});

export default function Promo() {
	return <DynamicPromoSlider />;
}
