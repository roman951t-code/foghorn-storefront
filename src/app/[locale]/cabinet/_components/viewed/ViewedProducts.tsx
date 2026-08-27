import { SimpleGrid, Box, EmptyState } from '@chakra-ui/react';
import { LuUserRoundCheck } from 'react-icons/lu';
import ProductCard, { type CardProduct } from '@/features/product/cards/ProductCard';
import { CABINET_PRODUCTS_GRID_CSS, PRODUCT_CARD_HORIZONTAL_GAP } from '@/constants/grids';

type Props = {
	products: CardProduct[];
	emptyText: string;
};

export default function ViewedProducts({ products, emptyText }: Props) {
	if (!products.length) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<LuUserRoundCheck />
					</EmptyState.Indicator>
					<EmptyState.Title>{emptyText}</EmptyState.Title>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	return (
		<SimpleGrid
			my='4'
			className='productsSlider'
			css={CABINET_PRODUCTS_GRID_CSS}
			columnGap={PRODUCT_CARD_HORIZONTAL_GAP}
			gapY='4'
			w='100%'
		>
			{products.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	);
}
