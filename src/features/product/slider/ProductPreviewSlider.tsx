'use client';

import dynamic from 'next/dynamic';
import { HStack, Skeleton, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { toPreviewImage } from '@/utils/productImages';

type ProductPreviewSliderProps = {
	images: string[];
	productName?: string;
};

const img1 = '/assets/images/temp/1.webp';
const img2 = '/assets/images/temp/2.webp';

function ProductPreviewSkeleton() {
	return (
		<HStack overflowX='hidden' overflowY='hidden' alignSelf='center'>
			<Skeleton width='116px' height='116px' borderRadius='sm' />
		</HStack>
	);
}

function ProductPreviewSwiper({ images, productName }: ProductPreviewSliderProps) {
	const baseImages = images.length ? images : [img1, img2];
	const previewImages = baseImages.map(toPreviewImage);
	const altText = productName ? `${productName} photo` : 'Product photo';

	return (
		<Swiper navigation modules={[Navigation]} className='productPreviewSwiper'>
			{previewImages.map((src, i) => {
				const isFirst = i === 0;
				return (
					<SwiperSlide key={i}>
						<Box as='div' _focus={{ outline: 'none' }}>
							<Image
								loading={isFirst ? undefined : 'lazy'}
								src={src}
								width={120}
								height={120}
								alt={altText}
								priority={isFirst}
								fetchPriority={isFirst ? 'high' : undefined}
								style={{
									borderRadius: '6px',
									width: '118px',
									height: '118px',
									objectFit: 'cover',
								}}
								sizes='(max-width: 768px) 35vw, 120px'
							/>
						</Box>
					</SwiperSlide>
				);
			})}
		</Swiper>
	);
}

const DynamicProductPreviewSlider = dynamic(
	() => Promise.resolve(ProductPreviewSwiper),
	{
		ssr: false,
		loading: () => <ProductPreviewSkeleton />,
	}
);

export default function ProductPreviewSlider(props: ProductPreviewSliderProps) {
	return <DynamicProductPreviewSlider {...props} />;
}
