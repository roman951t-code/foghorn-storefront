'use client';
import React, { useState } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, LinkBox, Link, Icon } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import { LocaleNavLink } from '../links/LocaleNavLink';
import { Rating } from '../chakra/rating';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { useCart } from '@/components/providers/CartProvider';
import { toaster } from '../chakra/toaster';
import { IoBagCheckOutline } from 'react-icons/io5';
import { addToFavourite } from '@/actions/wishlist/addToWishList';

type Props = {
	product: any;
};

export default function ProductCard({ product }: Props) {
	const t = useTranslations('Products');
	const cartT = useTranslations('Cart');
	const discount = product?.discountPrice ? product?.basePrice! - product?.discountPrice : 0;
	const isInStock = product?.inStock;

	const [isLoading, setIsLoading] = useState(false);
	const { productIds, handleAddItem } = useCart();

	if (!product) return null;

	const isInCart = productIds.includes(product?.id);

	const handleAdd = async () => {
		setIsLoading(true);

		try {
			const result = await handleAddItem(product);

			if (!result.success) {
				toaster.error({ title: cartT('cartUpdateFailed'), duration: 5000 });
			}
		} catch {
			toaster.error({ title: cartT('cartUpdateFailed'), duration: 5000 });
		} finally {
			setIsLoading(false);
		}
	};

	const handleFavourite = async () => {
		try {
			const result = await addToFavourite(product.id);
			if (result.success) {
				if (result.added) {
					toaster.success({ title: result.message });
				} else if (result.removed) {
					toaster.info({ title: result.message });
				}
			} else {
				toaster.error({ title: result.message });
			}
		} catch {
			toaster.error({ title: cartT('wishlistUpdateFailed') });
		}
	};

	return (
		<Card.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			minWidth='200px'
			w='full'
			h='full'
			border='1px solid'
			borderColor='border.dark'
			bg={isInStock ? 'bg.tertiary' : 'gray.100/10'}
			opacity={isInStock ? '1' : '.9'}
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: { base: 'orange', _dark: 'yellow' },
			}}
		>
			<Flex direction='column' gap={2} p={4} pt='2' h='full'>
				<Flex align='center' justifyContent='space-between'>
					{isInCart ? (
						<Icon
							size='lg'
							aria-label='Cart'
							colorPalette='green'
							color={{ base: 'colorPalette.600', _dark: 'colorPalette.500' }}
						>
							<IoBagCheckOutline />
						</Icon>
					) : (
						<IconButton
							loading={isLoading}
							onClick={handleAdd}
							disabled={!isInStock}
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
					)}

					<IconButton
						onClick={handleFavourite}
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
					<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px' mt='0.5' w='100%'>
						<LocaleNavLink
							href={`/products/${product.fullSlug}`}
							textDecorationColor='main'
							color='main'
							variant='underline'
						>
							{product.name}
						</LocaleNavLink>

						{!isInStock && (
							<Text color='main' fontSize='md' mt='3'>
								{t('productIsOutOfStock')}
							</Text>
						)}
					</Card.Title>

					<Text color='main' fontSize='2xl' mt='2'>
						{product?.discountPrice ?? product.basePrice} ₴
					</Text>

					{discount > 0 && (
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							{parseInt(product?.basePrice!.toFixed(2))}₴
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' ml='12px'>
								- {parseInt(discount.toFixed(2))}₴
							</Badge>
						</Text>
					)}
				</LinkBox>

				<HStack gap='4' mt='1'>
					<Rating readOnly size='xs' defaultValue={product.averageRating ?? 0} />
					<Link
						href={`/products/${product.fullSlug}/?tab=feedback`}
						variant='underline'
						fontSize='sm'
						color='main'
						_focus={{ outline: 'none' }}
					>
						{t('feedback')} ({product.reviewCount ?? 0})
					</Link>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
