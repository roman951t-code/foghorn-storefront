'use client';
import { useId, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, LinkBox, Link, Icon } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Rating } from '@/components/ui/chakra/rating';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { useCart } from '@/hooks/useCart';
import { useWishList } from '@/hooks/useWishList';
import { SubcategoryProduct } from '@/types/product';
import { buildProductImages } from '@/utils/productImages';
import { MdOutlineShoppingCart, MdShoppingCart } from 'react-icons/md';
import { FaHeart } from 'react-icons/fa';

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
	const ratingId = useId();

	const [isLoading, setIsLoading] = useState(false);
	const { productIds, handleAddItem, handleRemoveItem } = useCart();
	const { ids: wishListIds, handleWishAdd, handleWishRemove } = useWishList();
	const previewImages = product.images?.length
		? product.images
		: buildProductImages(product.imageUrl).slice(0, 3);

	if (!product) return null;

	const isInCart = productIds.includes(product?.id);
	const isInWishlist = wishListIds.includes(product?.id);

	const addToCart = async () => {
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

	const removeFromCart = async () => {
		setIsLoading(true);

		try {
			const result = await handleRemoveItem(product.id);

			if (!result.success) {
				showToaster('error', cartT('cartRemoveFailed'));
			}
		} catch {
			showToaster('error', cartT('cartRemoveFailed'));
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
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			w='full'
			maxW='300px'
			minW='250px'
			mx='auto'
			h='full'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg={isInStock ? 'bg.tertiary' : 'gray.100/10'}
			opacity={isInStock ? '1' : '.9'}
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: { base: 'orange', _dark: 'yellow' },
			}}
		>
			<Flex direction='column' gap={2} p={3} pt='2' h='full' justifyContent='space-between'>
				<Flex align='center' justifyContent='space-between'>
					<IconButton
						loading={isLoading}
						onClick={isInCart ? removeFromCart : addToCart}
						aria-label='Cart add and remove'
						variant='ghost'
						disabled={!isInStock}
						rounded='md'
						colorPalette='green'
						color={{ base: 'colorPalette.600', _dark: 'colorPalette.500' }}
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.600',
							color: 'main.lightOnly',
						}}
					>
						<Icon size='lg' aria-label='Wish'>
							{isInCart ? <MdShoppingCart /> : <MdOutlineShoppingCart />}
						</Icon>
					</IconButton>

					<IconButton
						onClick={isInWishlist ? removeFromWishList : addToWishList}
						aria-label='Favourite'
						variant='ghost'
						rounded='md'
						colorPalette='red'
						color='colorPalette.400'
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.400',
							color: 'main.lightOnly',
						}}
					>
						{isInWishlist ? <FaHeart /> : <FiHeart />}
					</IconButton>
				</Flex>

				<LocaleNavLink href={`/products/${fullSlug}`} display='block' aria-label={name}>
					<ProductPreviewSlider images={previewImages} productName={name} />
				</LocaleNavLink>

				<LinkBox mt='2' textAlign={{ base: 'center', sm: 'left' }}>
					<Card.Title fontWeight='medium' w='100%' as='span'>
						<LocaleNavLink
							href={`/products/${fullSlug}`}
							textDecorationColor='main'
							color='main'
							fontSize='17px'
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

					<Text
						color='main'
						fontSize='xl'
						mt='1'
						textWrap='wrap'
						textAlign={{ base: 'center', sm: 'left' }}
					>
						{`$${discountPrice ?? basePrice}`}
						{discount > 0 && (
							<Text as='span' pl='2' color='main' fontSize='sm' textDecoration='line-through'>
								{`$${parseInt(basePrice.toFixed(2))}`}
								<Badge
									variant='solid'
									color='black'
									bg='main.secondary'
									fontWeight='semibold'
									ml='8px'
								>
									-{`$${parseInt(discount.toFixed(2))}`}
								</Badge>
							</Text>
						)}
					</Text>
				</LinkBox>

				<HStack gap='4' mt='1' justifyContent={{ base: 'center', sm: 'flex-start' }}>
					<Rating
						id={`product-card-rating-${product.id}-${ratingId}`}
						readOnly
						size='xs'
						defaultValue={product.averageRating ?? 0}
					/>
					<Link
						href={`/products/${fullSlug}/?tab=feedback`}
						variant='underline'
						fontSize='sm'
						aria-label={`${t('feedback')} (${product.reviewCount ?? 0}) — ${name}`}
						color='main'
						_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
					>
						{t('feedback')} ({product.reviewCount ?? 0})
					</Link>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
