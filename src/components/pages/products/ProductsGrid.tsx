import { SimpleGrid, Box, VStack } from '@chakra-ui/react';
import { EmptyState } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '../../reusable/cards/ProductCard';
import { Product } from '@/types/product';

interface Props {
	products: Product[];
	category?: string;
	subcategory?: string;
	notFound: string;
}

export default function ProductsGrid({ products, notFound, category, subcategory }: Props) {
	if (!products || products.length === 0) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{notFound}</EmptyState.Title>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	const columns = { base: 1, prodXs: 2, prodSm: 3, prodLg: 4, prodXl: 5 } as any;

	return (
		<SimpleGrid className='productsSlider' columns={columns} gapX='2' gapY='4'>
			{products.map((product) => (
				<Box key={product.id}>
					<ProductCard
						product={product}
						category={category || product?.category!}
						subcategory={subcategory || product?.subcategory!}
					/>
				</Box>
			))}
		</SimpleGrid>
	);
}
