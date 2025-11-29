'use client';
import { useState } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, LinkBox, Link, Icon } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Rating } from '@/components/ui/chakra/rating';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { IoBagCheckOutline } from 'react-icons/io5';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { useCart } from '@/hooks/useCart';
import { useWishList } from '@/hooks/useWishList';
import { BsBagHeart } from 'react-icons/bs';
import { SubcategoryProduct } from '@/types/product';

export type CardProduct = SubcategoryProduct & {
	imageUrl?: string | null;
	basePrice?: number;
	discountPrice?: number | null;
	fullSlug?: string;
	name?: string;
	inStock?: boolean;
	tags?: string[];
};

type Props = {
	product: CardProduct;
};

export default function ProductCard({ product }: Props) {
	const t = useTranslations('products');
	const cartT = useTranslations('cart');
	const wishT = useTranslations('wishlist');
	const basePrice = product.basePrice ?? 0;
	const discountPrice = product.discountPrice ?? null;
	const fullSlug = product.fullSlug ?? '#';
	const name = product.name ?? '';
	const isInStock = product.inStock ?? false;
	const discount = discountPrice ? basePrice - discountPrice : 0;

	const [isLoading, setIsLoading] = useState(false);
	const { productIds, handleAddItem } = useCart();
	const { ids: wishListIds, handleWishAdd, handleWishRemove } = useWishList();

	if (!product) return null;

	const isInCart = productIds.includes(product?.id);
	const isInWishlist = wishListIds.includes(product?.id);

	const addToCard = async () => {
		setIsLoading(true);

		try {
			const result = await handleAddItem(product);

			if (!result.success) {
				showToaster('error', toasterMessages.cartUpdateFailed(cartT));
			}
		} catch {
			showToaster('error', toasterMessages.cartUpdateFailed(cartT));
		} finally {
			setIsLoading(false);
		}
	};

	const addToWishList = async () => {
		try {
			const result = await handleWishAdd(product);

			if (!result.success) {
				showToaster('error', toasterMessages.wishlistUpdateFailed(wishT));
			}
		} catch {
			showToaster('error', toasterMessages.wishlistUpdateFailed(wishT));
		}
	};

	const removeFromWishList = async () => {
		try {
			const result = await handleWishRemove(product.id);

			if (!result.success) {
				showToaster('error', toasterMessages.wishlistUpdateFailed(wishT));
			}
		} catch {
			showToaster('error', toasterMessages.wishlistUpdateFailed(wishT));
		}
	};

	return (
		<Card.Root
			userSelect='none'
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			minW='200px'
			maxW='240px'
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
							onClick={addToCard}
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
						onClick={isInWishlist ? removeFromWishList : addToWishList}
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
						{isInWishlist ? (
							<Icon size='md' aria-label='Wish'>
								<BsBagHeart />
							</Icon>
						) : (
							<FiHeart />
						)}
					</IconButton>
				</Flex>

					<ProductPreviewSlider imageUrl={product.imageUrl ?? null} />

				<LinkBox>
					<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px' mt='0.5' w='100%'>
							<LocaleNavLink
								href={`/products/${fullSlug}`}
								textDecorationColor='main'
								color='main'
								variant='underline'
							>
								{name}
							</LocaleNavLink>

							{!isInStock && (
								<Text color='main' fontSize='md' mt='3'>
									{t('productIsOutOfStock')}
								</Text>
							)}
					</Card.Title>

						<Text color='main' fontSize='2xl' mt='2'>
						{discountPrice ?? basePrice} ₴
					</Text>

					{discount > 0 && (
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							{parseInt(basePrice.toFixed(2))}₴
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' ml='12px'>
								- {parseInt(discount.toFixed(2))}₴
							</Badge>
						</Text>
					)}
				</LinkBox>

				<HStack gap='4' mt='1'>
					<Rating
						id={`product-card-rating-${product.id}`}
						readOnly
						size='xs'
						defaultValue={product.averageRating ?? 0}
					/>
					<Link
						href={`/products/${fullSlug}/?tab=feedback`}
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
