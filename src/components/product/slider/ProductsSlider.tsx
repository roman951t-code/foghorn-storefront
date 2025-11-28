'use client';

import { HStack } from '@chakra-ui/react';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/cards/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useEffect, useState } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';

import { productsBreakpoints } from '@/data/breakpoints';
import { getProductsByTag } from '@/actions/products/getProductsByTag';
import { SubcategoryProduct } from '@/types/product';

function ProductsSkeletonFallback() {
	return (
		<HStack gap='4' mt='8' overflowX='auto'>
			{Array.from({ length: 2 }).map((_, i) => (
				<LoadingSkeleton key={i} />
			))}
		</HStack>
	);
}

type Props = {
	tag: string;
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

export default function ProductsSlider({ tag }: Props) {
	const [products, setProducts] = useState<SubcategoryProduct[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			const data = await getProductsByTag(tag);
			if (mounted) {
				setProducts(data?.products);
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [tag]);

	if (loading) return <ProductsSkeletonFallback />;

	return products.length > 0 ? <ProductsSwiper products={products} /> : null;
}
