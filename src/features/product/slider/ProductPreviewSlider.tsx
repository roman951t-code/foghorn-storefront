'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { HStack, Skeleton, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { PRODUCT_PLACEHOLDER_IMAGE, toPreviewImage } from '@/utils/productImages';

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
	const normalizedImages = images.filter((src): src is string => src.trim().length > 0);
	const baseImages = normalizedImages.length
		? normalizedImages
		: [PRODUCT_PLACEHOLDER_IMAGE, PRODUCT_PLACEHOLDER_IMAGE];
	const previewImages = baseImages.map(toPreviewImage);
	const previewSignature = previewImages.join('|');
	const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

	useEffect(() => {
		setFailedIndexes(new Set());
	}, [previewSignature]);

	const markImageFailed = (index: number) => () => {
		setFailedIndexes((prev) => {
			if (prev.has(index)) return prev;
			const next = new Set(prev);
			next.add(index);
			return next;
		});
	};
	const altText = productName ? `${productName} photo` : 'Product photo';

	return (
		<Swiper navigation loop modules={[Navigation]} className='productPreviewSwiper'>
			{previewImages.map((src, i) => {
				const isFirst = i === 0;
				const resolvedSrc = failedIndexes.has(i) ? PRODUCT_PLACEHOLDER_IMAGE : src;
				return (
					<SwiperSlide key={i}>
						<Box
							as='div'
							_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							borderRadius='sm'
							overflow='hidden'
							display='inline-block'
						>
							<Image
								loading={isFirst ? undefined : 'lazy'}
								src={resolvedSrc}
								width={120}
								height={120}
								alt={altText}
								onError={markImageFailed(i)}
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
