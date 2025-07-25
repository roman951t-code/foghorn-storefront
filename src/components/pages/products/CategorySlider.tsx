'use client';
import dynamic from 'next/dynamic';
import { HStack } from '@chakra-ui/react';
import { LoadingSkeleton } from '@/components/reusable/Skeleton';
import CategoryCard from '@/components/reusable/cards/CategoryCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

const breakpoints = {
	518: { slidesPerView: 2 },
	756: { slidesPerView: 3 },
	1000: { slidesPerView: 4 },
	1234: { slidesPerView: 5 },
};

const categories = [
	{
		title: 'Меблі та техніка',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 1',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 2',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 3',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 4',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 5',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
	{
		title: 'Меблі та техніка 6',
		imageUrl:
			'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80',
		subcategories: [
			{ name: 'Стільці', href: '/products/123' },
			{ name: 'Дивани', href: '/products/123' },
			{ name: 'Ліжка', href: '/products/123' },
			{ name: 'Столи', href: '/products/123' },
			{ name: 'Шафи', href: '/products/123' },
		],
		viewAllHref: '/products/123',
	},
];

function CategorySliderInner() {
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
			{categories.map((cat, index) => (
				<SwiperSlide key={index}>
					<CategoryCard {...cat} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}

function CategorySliderFallback() {
	return (
		<HStack gap='4' mt='8' justifyContent='space-between' overflow='hidden'>
			<LoadingSkeleton />
			<LoadingSkeleton />
			<LoadingSkeleton />
		</HStack>
	);
}

const DynamicCategorySlider = dynamic(() => Promise.resolve(CategorySliderInner), {
	ssr: false,
	loading: () => <CategorySliderFallback />,
});

export default function CategorySlider() {
	return <DynamicCategorySlider />;
}
