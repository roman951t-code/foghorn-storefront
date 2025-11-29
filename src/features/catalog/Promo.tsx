'use client';

import dynamic from 'next/dynamic';
import { Flex, HStack, Text, useBreakpointValue } from '@chakra-ui/react';
import { LoadingPromoSkeleton } from '@/components/ui/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const promoTexts = [
	{ id: 1, text: '🔥 Up to 50% off on all electronics!' },
	{ id: 2, text: '🚚 Free shipping on orders over $100!' },
	{ id: 3, text: '💳 Pay later with our flexible payment options!' },
];

const breakpoints = {
	690: { slidesPerView: 2 },
	768: { slidesPerView: 1 },
	1100: { slidesPerView: 2 },
	1564: { slidesPerView: 3 },
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
			spaceBetween={6}
			breakpoints={breakpoints}
			modules={[Autoplay]}
			autoplay={false}
			className='promoSlider'
			grabCursor={true}
			simulateTouch={true}
			touchStartPreventDefault={false}
			touchRatio={1}
		>
			{promoTexts.map((promo) => (
				<SwiperSlide key={promo.id}>
					<Flex
						userSelect='none'
						justify='center'
						align='center'
						cursor='pointer'
						bg='transparent'
						border='1px solid'
						borderColor='border'
						borderRadius='md'
						height='472px'
						width='100%'
						color='main'
						fontWeight='400'
						fontSize='xl'
						textAlign='center'
						boxShadow='md'
						p={6}
					>
						<Text>{promo.text}</Text>
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
