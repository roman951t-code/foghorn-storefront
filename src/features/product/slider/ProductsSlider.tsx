'use client';

import ProductCard from '@/features/product/cards/ProductCard';
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

import { productsBreakpoints } from '@/data/breakpoints';
import { SubcategoryProduct } from '@/types/product';
import ProductCardsSkeletonGrid from '@/components/ui/ProductCardsSkeletonGrid';

type Props = {
	products?: SubcategoryProduct[] | null;
};

function ProductsSwiper({ products }: { products: SubcategoryProduct[] }) {
	return (
		<Swiper
			loop
			navigation
			breakpoints={productsBreakpoints}
			slidesPerView={1}
			spaceBetween={8}
			modules={[Navigation]}
			className='productsSlider'
		>
			{products.map((p) => (
				<SwiperSlide key={p?.id}>
					<ProductCard product={p} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicProductsSwiper = dynamic(() => Promise.resolve(ProductsSwiper), {
	ssr: false,
	loading: () => <ProductCardsSkeletonGrid />,
});

export default function ProductsSlider({ products }: Props) {
	return <DynamicProductsSwiper products={products ?? []} />;
}
