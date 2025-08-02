'use client';

import dynamic from 'next/dynamic';
import CategoryCard from '@/components/reusable/cards/CategoryCard';
import { LoadingSkeleton } from '@/components/reusable/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import type { CategoryWithSubcategories } from '@/types/product';

const breakpoints = {
	518: { slidesPerView: 2 },
	756: { slidesPerView: 3 },
	1000: { slidesPerView: 4 },
	1234: { slidesPerView: 5 },
};

function CategorySliderInner({ category }: { category: CategoryWithSubcategories }) {
	return (
		<Swiper
			loop
			navigation
			modules={[Navigation]}
			breakpoints={breakpoints}
			slidesPerView={1}
			spaceBetween={8}
			className='productsSlider'
		>
			{category.children.map((sub) => (
				<SwiperSlide key={sub.id}>
					<CategoryCard
						title={sub.name}
						imageUrl={
							'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80'
						}
						products={sub.products.map((product) => ({
							name: product.name,
							href: `/products/${category.slug}/${sub.slug}/${product.slug}`,
						}))}
						viewAllHref={`/products/${category.slug}/${sub.slug}`}
					/>
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicCategorySlider = dynamic(() => Promise.resolve(CategorySliderInner), {
	ssr: false,
	loading: () => <LoadingSkeleton />,
});

export default function CategorySlider({ category }: { category: CategoryWithSubcategories }) {
	return <DynamicCategorySlider category={category} />;
}
