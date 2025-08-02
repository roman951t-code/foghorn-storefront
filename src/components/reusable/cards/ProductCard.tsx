import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, LinkBox } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { LocaleNavLink } from '../links/LocaleNavLink';
import { Rating } from '../chakra/rating';
import { Product } from '@/types/product';

type Props = {
	category: string;
	subcategory: string;
	product: Product;
};

export default function ProductCard({ product, category, subcategory }: Props) {
	if (!product) return null;
	const t = useTranslations('Products');
	const discount = product?.discountPrice ? product.basePrice - product?.discountPrice : 0;

	return (
		<Card.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			minWidth='200px'
			w='full'
			h='full'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: { base: 'orange', _dark: 'yellow' },
			}}
		>
			<Flex direction='column' gap={2} p={4} pt='2.5' h='full'>
				<Flex align='center' justifyContent='space-between'>
					<IconButton
						aria-label='Cart'
						variant='ghost'
						rounded='full'
						colorPalette='green'
						color={{ base: 'colorPalette.600', _dark: 'colorPalette.500' }}
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.600',
							color: 'main.lightOnly',
						}}
					>
						<FiShoppingCart />
					</IconButton>
					<IconButton
						aria-label='Favourite'
						variant='ghost'
						rounded='full'
						colorPalette='red'
						color='colorPalette.400'
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.400',
							color: 'main.lightOnly',
						}}
					>
						<FiHeart />
					</IconButton>
				</Flex>

				<ProductPreviewSlider />

				<LinkBox>
					<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px' mt='1' w='100%'>
						<LocaleNavLink
							href={`/products/${category}/${subcategory}/${product?.slug}`}
							textDecorationColor='main'
							color='main'
							variant='underline'
						>
							{product.name}
						</LocaleNavLink>
					</Card.Title>

					<Text color='main' fontSize='2xl' mt='2'>
						{product?.discountPrice ?? product.basePrice} ₴
					</Text>

					{discount > 0 && (
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							{product.basePrice} ₴
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' ml='12px'>
								- {discount}₴
							</Badge>
						</Text>
					)}
				</LinkBox>

				<HStack gap='4' mt='2'>
					<Rating readOnly size='xs' defaultValue={product.averageRating ?? 0} />
					<LocaleNavLink
						href={`/products/${category}/${subcategory}/${product?.slug}?tab=feedback`}
						variant='underline'
						fontSize='sm'
						color='main'
					>
						{t('feedback')} ({product.reviewCount ?? 0})
					</LocaleNavLink>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
