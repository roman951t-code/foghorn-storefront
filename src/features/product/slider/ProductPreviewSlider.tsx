'use client';

import dynamic from 'next/dynamic';
import { HStack, Skeleton, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { toPreviewImage } from '@/utils/productImages';
import { ASSET_IMAGES } from '@/constants/assets';

type ProductPreviewSliderProps = {
	images: string[];
	productName?: string;
};

function ProductPreviewSkeleton() {
	return (
		<HStack overflowX='hidden' overflowY='hidden' alignSelf='center'>
			<Skeleton width='116px' height='116px' borderRadius='lg' />
		</HStack>
	);
}

function ProductPreviewSwiper({ images, productName }: ProductPreviewSliderProps) {
	const baseImages = images.length
		? images
		: [ASSET_IMAGES.tempProduct1, ASSET_IMAGES.tempProduct2];
	const previewImages = baseImages.map(toPreviewImage);
	const altText = productName ? `${productName} photo` : 'Product photo';

	return (
		<Swiper navigation loop modules={[Navigation]} className='productPreviewSwiper'>
			{previewImages.map((src, i) => {
				const isFirst = i === 0;
				return (
					<SwiperSlide key={i}>
						<Box
							as='div'
							_focus={{ outline: 'none' }}
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							borderRadius='lg'
							overflow='hidden'
							display='inline-block'
						>
							<Image
								loading={isFirst ? undefined : 'lazy'}
								src={src}
								width={120}
								height={120}
								alt={altText}
								priority={isFirst}
								fetchPriority={isFirst ? 'high' : undefined}
								style={{
									width: '150px',
									height: '150px',
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

const DynamicProductPreviewSlider = dynamic(() => Promise.resolve(ProductPreviewSwiper), {
	ssr: false,
	loading: () => <ProductPreviewSkeleton />,
});

export default function ProductPreviewSlider(props: ProductPreviewSliderProps) {
	return <DynamicProductPreviewSlider {...props} />;
}
