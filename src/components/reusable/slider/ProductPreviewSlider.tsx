'use client';

import dynamic from 'next/dynamic';
import { HStack, Skeleton, Link } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFlip, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-flip';
import 'swiper/css/navigation';

const img1 = '/assets/images/temp/1.webp';
const img2 = '/assets/images/temp/2.webp';
const images = [img1, img2, img2];

function ProductPreviewSkeleton() {
	return (
		<HStack gap='4' mt='4' overflowX='auto' overflowY='hidden'>
			{images.map((_, i) => (
				<Skeleton key={i} width='116px' height='116px' borderRadius='md' />
			))}
		</HStack>
	);
}

function ProductPreviewSwiper() {
	return (
		<Swiper
			effect='flip'
			navigation
			modules={[EffectFlip, Navigation]}
			className='productPreviewSwiper'
		>
			{images.map((src, i) => (
				<SwiperSlide key={i}>
					<Link href='#' variant='plain' _focus={{ outline: 'none' }}>
						<Image
							loading='lazy'
							src={src}
							width={116}
							height={116}
							alt='Product photo'
							style={{ borderRadius: '8px' }}
						/>
					</Link>
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicProductPreviewSlider = dynamic(() => Promise.resolve(ProductPreviewSwiper), {
	ssr: false,
	loading: () => <ProductPreviewSkeleton />,
});

export default function ProductPreviewSlider() {
	return <DynamicProductPreviewSlider />;
}
