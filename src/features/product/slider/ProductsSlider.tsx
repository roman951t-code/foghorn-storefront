'use client';

import ProductCard from '@/features/product/cards/ProductCard';
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCardsSkeletonGrid from '@/components/ui/ProductCardsSkeletonGrid';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

import { productsBreakpoints } from '@/data/breakpoints';
import { SubcategoryProduct } from '@/types/product';

type Props = {
	products?: SubcategoryProduct[] | null;
	loading?: boolean;
	skeletonLimit?: number;
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

export default function ProductsSlider({ products, loading, skeletonLimit }: Props) {
	if (loading) return <ProductCardsSkeletonGrid limit={skeletonLimit} />;
	if (!products) return null;
	return products.length > 0 ? <DynamicProductsSwiper products={products} /> : null;
}
