'use client';
import { useId, useState } from 'react';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
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
import { buildProductImageGallery } from '@/utils/productImages';
import { formatUsdPrice, roundPrice } from '@/utils/priceFormatting';
import { BsBagCheck, BsBagHeart } from 'react-icons/bs';

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
	const basePrice = roundPrice(product.basePrice ?? 0);
	const discountPrice = product.discountPrice != null ? roundPrice(product.discountPrice) : null;
	const rawDiscount = discountPrice != null ? roundPrice(basePrice - discountPrice) : 0;
	const hasDiscount = rawDiscount > 0;
	const displayPrice = hasDiscount && discountPrice != null ? discountPrice : basePrice;
	const fullSlug = product.fullSlug ?? '#';
	const name = product.name ?? '';
	const isInStock = product.inStock ?? false;
	const discount = hasDiscount ? rawDiscount : 0;
	const ratingId = useId();

	const [isLoading, setIsLoading] = useState(false);
	const [activePreviewIndex, setActivePreviewIndex] = useState(0);
	const { productIds, handleAddItem, handleRemoveItem } = useCart();
	const { ids: wishListIds, handleWishAdd, handleWishRemove } = useWishList();
	const previewImages = buildProductImageGallery(product.imageUrl, product.images, 3);
	const maxPreviewIndex = Math.max(0, previewImages.length - 1);
	const safePreviewIndex = Math.min(Math.max(activePreviewIndex, 0), maxPreviewIndex);
	const sliderHref = fullSlug === '#' ? '#' : `/products/${fullSlug}?image=${safePreviewIndex + 1}`;

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
			h='full'
			maxW='300px'
			minW='250px'
			mx='auto'
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
						color={{ base: 'colorPalette.600', _dark: 'colorPalette.400' }}
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.600',
							color: 'main.lightOnly',
						}}
					>
						<Icon size='md' aria-label='Wish'>
							{isInCart ? <BsBagCheck /> : <FiShoppingCart />}
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
						{isInWishlist ? <BsBagHeart /> : <FiHeart />}
					</IconButton>
				</Flex>

				<LocaleNavLink href={sliderHref} display='block' aria-label={name}>
					<ProductPreviewSlider
						images={previewImages}
						productName={name}
						onActiveIndexChange={setActivePreviewIndex}
					/>
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
							<Text color='main' fontSize='md' mt='2'>
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
						{formatUsdPrice(displayPrice)}
						{discount > 0 && (
							<Text
								as='span'
								pl='2'
								color='main'
								fontSize={{ base: 'md', md: 'sm' }}
								textDecoration='line-through'
							>
								{formatUsdPrice(basePrice)}
								<Badge
									variant='solid'
									color='black'
									bg='main.secondary'
									fontWeight='semibold'
									ml='8px'
								>
									-{formatUsdPrice(discount)}
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
						fontSize={{ base: 'md', md: 'sm' }}
						aria-label={`${t('feedback')} (${product.reviewCount ?? 0}) — ${name}`}
						color='main'
						_focusVisible={{
							outline: '2px solid',
							outlineColor: 'main.secondary',
							outlineOffset: '2px',
						}}
					>
						{t('feedback')} ({product.reviewCount ?? 0})
					</Link>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
