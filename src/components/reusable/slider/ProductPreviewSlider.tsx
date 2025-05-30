'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from '@chakra-ui/react';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/effect-flip';
import 'swiper/css/navigation';

const img1 = '/assets/images/temp/1.webp';
const img2 = '/assets/images/temp/2.webp';

import { EffectFlip, Navigation } from 'swiper/modules';

export default function ProductPreviewSlider() {
	return (
		<Swiper
			effect={'flip'}
			navigation
			modules={[EffectFlip, Navigation]}
			className='productPreviewSwiper'
		>
			<SwiperSlide>
				<Link href='#' variant='plain' _focus={{ outline: 'none' }}>
					<Image
						style={{ width: 'auto', height: 'auto' }}
						src={img1}
						width={120}
						height={120}
						alt='Product photo'
					/>
				</Link>
			</SwiperSlide>
			<SwiperSlide>
				<Link href='#' variant='plain' _focus={{ outline: 'none' }}>
					<Image
						style={{ width: 'auto', height: 'auto' }}
						width={120}
						height={120}
						src={img2}
						alt='Product photo'
					/>
				</Link>
			</SwiperSlide>
			<SwiperSlide>
				<Link href='#' variant='plain' _focus={{ outline: 'none' }}>
					<Image
						style={{ width: 'auto', height: 'auto' }}
						width={120}
						height={120}
						src={img2}
						alt='Product photo'
					/>
				</Link>
			</SwiperSlide>
		</Swiper>
	);
}
