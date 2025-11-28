import { SimpleGrid, Box } from '@chakra-ui/react';
import ProductCard, { type CardProduct } from '@/components/product/cards/ProductCard';

export default function ViewedProducts() {
	const placeholderProduct: CardProduct = {
		id: 'placeholder',
		imageUrl: null,
		basePrice: 0,
		discountPrice: null,
		fullSlug: '#',
		name: '',
		inStock: false,
		averageRating: 0,
		reviewCount: 0,
	};

	return (
		<SimpleGrid
			my='4'
			className='productsSlider'
			columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
			gapX='2'
			gapY='4'
		>
			{new Array(9).fill(null).map((_, index) => (
				<Box key={index}>
					<ProductCard product={{ ...placeholderProduct, id: `placeholder-${index}` }} />
				</Box>
			))}
		</SimpleGrid>
	);
}
