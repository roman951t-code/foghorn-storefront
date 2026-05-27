'use client';

import ProductCard from '@/features/product/cards/ProductCard';
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { SubcategoryProduct } from '@/types/product';
import { productsBreakpoints } from '@/data/breakpoints';
import { PRODUCT_CARD_HORIZONTAL_GAP_PX } from '@/constants/grids';
import ProductCardsSkeletonGrid from '@/components/ui/ProductCardsSkeletonGrid';

const MAX_VISIBLE_PRODUCT_SLIDES = 6;

type Props = {
	products?: SubcategoryProduct[] | null;
};

function ProductsSwiper({ products }: { products: SubcategoryProduct[] }) {
	const hasMultipleProducts = products.length > 1;

	return (
		<Swiper
			loop={hasMultipleProducts}
			loopAddBlankSlides={false}
			navigation={hasMultipleProducts}
			breakpoints={productsBreakpoints}
			slidesPerView={1}
			slidesPerGroup={hasMultipleProducts ? 2 : 1}
			spaceBetween={PRODUCT_CARD_HORIZONTAL_GAP_PX}
			modules={[Navigation]}
			className='productsSlider'
		>
			{products.map((p, index) => (
				<SwiperSlide key={p?.id}>
					<ProductCard product={p} imagePriority={index < MAX_VISIBLE_PRODUCT_SLIDES} />
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
