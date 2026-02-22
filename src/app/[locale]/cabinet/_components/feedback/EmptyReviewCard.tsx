'use client';

import { Accordion, Card, Flex, Stack, Text, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { useMemo } from 'react';
import FeedbackModal from '@/features/product/FeedbackModal';
import type { Review, SubcategoryProduct } from '@/types/product';
import {
	buildProductImages,
	resolveProductPrimaryImage,
	toPreviewImage,
} from '@/utils/productImages';
import { formatUsdPrice } from '@/utils/priceFormatting';

type Props = {
	product: SubcategoryProduct & { fullSlug: string };
	price: { current: number; previous: number | null; savings: number | null };
	onAddAction: (review: Review) => void;
};

export function EmptyReviewCard({ product, price, onAddAction }: Props) {
	const productHref = useMemo(() => `/products/${product.fullSlug}`, [product.fullSlug]);
	const previewImage = toPreviewImage(
		buildProductImages(product.imageUrl, 1)[0] || resolveProductPrimaryImage(product.imageUrl)
	);

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Accordion.Item value={product.id} borderBottom='none'>
				<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} gap='3' w='100%'>
					<LocaleNavLink href={productHref} mr='2'>
						<Box
							position='relative'
							w={{ base: '136px', sm: '114px' }}
							h={{ base: '136px', sm: '114px' }}
							borderRadius='md'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							overflow='hidden'
						>
							<Image
								fill
								sizes='(max-width: 479px) 136px, 114px'
								src={previewImage}
								alt={product.name ?? ''}
								style={{
									objectFit: 'contain',
									paddingTop: '4px',
								}}
							/>
						</Box>
					</LocaleNavLink>
					<Stack direction='column' gap={2} w='full' textAlign={{ base: 'center', sm: 'left' }}>
						<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px' as='div'>
							<LocaleNavLink
								href={`/products/${product.fullSlug}`}
								textDecoration='underline'
								fontSize='md'
								color='main'
							>
								{product.name}
							</LocaleNavLink>
						</Card.Title>
						{(product.subcategoryName || product.categoryName) && (
							<Text color='main.disabled' fontSize={{ base: 'md', md: 'sm' }} mt='-2'>
								{[product.categoryName, product.subcategoryName].filter(Boolean).join(' / ')}
							</Text>
						)}

						<Text color='main' fontSize='md' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
							{formatUsdPrice(price.current)}
							{price.previous != null && (
								<Text
									as='span'
									color='main.disabled'
									fontSize={{ base: 'md', md: 'sm' }}
									textDecoration='line-through'
									marginLeft='8px'
								>
									{formatUsdPrice(price.previous)}
								</Text>
							)}
						</Text>
					</Stack>
					<Flex flexShrink={0} alignSelf='flex-end' hideBelow='md'>
						<FeedbackModal productId={product.id} onSuccessAction={onAddAction} />
					</Flex>
				</Flex>
				<Flex flex={1} justifyContent='flex-end' hideFrom='md'>
					<FeedbackModal productId={product.id} onSuccessAction={onAddAction} />
				</Flex>
			</Accordion.Item>
		</Card.Root>
	);
}
