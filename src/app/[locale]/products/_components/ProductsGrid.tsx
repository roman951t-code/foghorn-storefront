'use client';
import { Grid, Box, VStack, EmptyState, Spinner } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '@/features/product/cards/ProductCard';
import { SubcategoryProduct } from '@/types/product';
import { PRODUCT_CARD_HORIZONTAL_GAP, PRODUCTS_GRID_CSS } from '@/constants/grids';
import { useFilterTransition } from './FilterTransition';

const ABOVE_THE_FOLD_PRODUCT_IMAGE_COUNT = 5;

interface Props {
	products: SubcategoryProduct[];
	notFound: string;
	limit?: number;
}

export default function ProductsGrid({ products, notFound, limit }: Props) {
	const { isPending } = useFilterTransition();
	const isEmpty = !products || products.length === 0;
	const visibleProducts = isEmpty ? [] : limit ? products.slice(0, limit) : products;

	return (
		<Box position='relative'>
			<Box
				opacity={isPending ? 0.5 : 1}
				pointerEvents={isPending ? 'none' : 'auto'}
				transition='opacity 0.15s ease-in-out'
				aria-busy={isPending}
			>
				{isEmpty ? (
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
				) : (
					<Grid
						className='productsSlider'
						columnGap={PRODUCT_CARD_HORIZONTAL_GAP}
						rowGap={4}
						css={PRODUCTS_GRID_CSS}
					>
						{visibleProducts.map((product, index) => (
							<Box key={product.id}>
								<ProductCard
									product={product}
									imagePriority={index < ABOVE_THE_FOLD_PRODUCT_IMAGE_COUNT}
								/>
							</Box>
						))}
					</Grid>
				)}
			</Box>
			{isPending ? (
				<Box position='absolute' inset={0} pointerEvents='none'>
					{/* Sticky-centering trick: an auto-height sticky element with
					    top:50% + translateY(-50%) tracks the vertical center of
					    whatever's currently visible, clamped to this box's own
					    bounds (the grid's height). h:100% capped at 100vh here
					    instead would leave zero "stuck range" (so no sticking at
					    all) whenever the grid is shorter than one viewport, which
					    is the common case for small result sets. */}
					<Box
						position='sticky'
						top='calc(50% + 16px)'
						transform='translateY(-50%)'
						display='flex'
						justifyContent='center'
					>
						<Spinner
							size='xl'
							color='main.accent'
							borderWidth='4px'
							css={{ '--spinner-size': '3rem' }}
						/>
					</Box>
				</Box>
			) : null}
		</Box>
	);
}
