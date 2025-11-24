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
function ProductPreviewSkeleton() {
	return (
		<HStack overflowX='hidden' overflowY='hidden' alignSelf='center'>
			<Skeleton width='116px' height='116px' borderRadius='sm' />
		</HStack>
	);
}

function ProductPreviewSwiper({ imageUrl }: { imageUrl: string }) {
	const images = [imageUrl, img1, img2];

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
							priority
							loading='eager'
							src={src}
							width={320}
							height={240}
							alt='Product photo'
							style={{
								borderRadius: '8px',
								width: '110px',
								height: 'auto',
							}}
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

export default function ProductPreviewSlider({ imageUrl }: { imageUrl: string }) {
	return <DynamicProductPreviewSlider imageUrl={imageUrl} />;
}
