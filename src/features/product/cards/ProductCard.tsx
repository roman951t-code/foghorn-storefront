'use client';
import { useId, useState } from 'react';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import {
	IconButton,
	Text,
	Flex,
	HStack,
	Card,
	Badge,
	LinkBox,
	Link,
	Icon,
	Box,
} from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Rating } from '@/components/ui/chakra/rating';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useCartActions, useIsProductInCart } from '@/hooks/useCart';
import { useIsProductInWishlist, useWishListActions } from '@/hooks/useWishList';
import { SubcategoryProduct } from '@/types/product';
import { buildProductImageGallery } from '@/utils/productImages';
import { formatUsdPrice, roundPrice } from '@/utils/priceFormatting';

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
	imagePriority?: boolean;
};

// Floating action button over the product image: white icon on a dark,
// translucent circle by default so it reads over any photo, switching to a
// solid colored circle once the product is in that state (in cart / wished).
function ImageActionButton({
	active,
	activeColor,
	...rest
}: {
	active: boolean;
	activeColor: string;
} & Omit<React.ComponentProps<typeof IconButton>, 'variant' | 'colorPalette'>) {
	return (
		<IconButton
			variant='plain'
			// Bigger on phones (44px, the standard minimum touch-target size)
			// where this card fills the full screen width; back to the more
			// compact 40px once a multi-column grid has room constraints.
			size={{ base: 'lg', cardSm: 'md' }}
			rounded='full'
			zIndex={2}
			bg={active ? activeColor : 'blackAlpha.600'}
			color='white'
			backdropFilter='blur(8px)'
			transition='all 0.2s ease-in-out'
			_hover={{ bg: active ? activeColor : 'blackAlpha.700' }}
			{...rest}
		/>
	);
}

// Isolated so its own isLoading toggle, and the re-render this product's
// in-cart boolean triggers, only touch this small button — not ProductCard's
// image slider/rating/price. useIsProductInCart selects just this product's
// membership, instead of the whole productIds array useCart() returns, so
// this only re-renders when ITS OWN boolean flips, not on every cart
// mutation for any product — see useIsProductInCart's own comment for why
// that distinction matters when 16-50 of these are mounted in a grid.
function ProductCardCartButton({
	product,
	isInStock,
}: {
	product: CardProduct;
	isInStock: boolean;
}) {
	const t = useTranslations('products');
	const cartT = useTranslations('cart');
	const [isLoading, setIsLoading] = useState(false);
	const isInCart = useIsProductInCart(product.id);
	const { handleAddItem, handleRemoveItem } = useCartActions();
	const name = product.name ?? '';

	const cartButtonLabel = !isInStock
		? `${t('productIsOutOfStock')}: ${name}`
		: isInCart
			? `${cartT('removeFromCart')}: ${name}`
			: `${cartT('addToCart')}: ${name}`;

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

	return (
		<ImageActionButton
			active={isInCart}
			activeColor='green.600'
			loading={isLoading}
			onClick={isInCart ? removeFromCart : addToCart}
			aria-label={cartButtonLabel}
			aria-pressed={isInCart}
			disabled={!isInStock}
			position='absolute'
			top='2'
			left='2'
		>
			<Icon size={{ base: 'lg', cardSm: 'md' }} aria-hidden='true'>
				<FiShoppingCart />
			</Icon>
		</ImageActionButton>
	);
}

// Isolated for the same reason as ProductCardCartButton above:
// useIsProductInWishlist selects just this product's membership, so toggling
// one card's wishlist heart doesn't re-render every other mounted card.
function ProductCardWishlistButton({ product }: { product: CardProduct }) {
	const wishT = useTranslations('wishlist');
	const isInWishlist = useIsProductInWishlist(product.id);
	const { handleWishAdd, handleWishRemove } = useWishListActions();
	const name = product.name ?? '';

	const wishlistButtonLabel = isInWishlist
		? `${wishT('removeFromWishlist')}: ${name}`
		: `${wishT('addToWishlist')}: ${name}`;

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
		<ImageActionButton
			active={isInWishlist}
			activeColor='red.500'
			onClick={isInWishlist ? removeFromWishList : addToWishList}
			aria-label={wishlistButtonLabel}
			aria-pressed={isInWishlist}
			position='absolute'
			top='2'
			right='2'
		>
			<Icon size={{ base: 'lg', cardSm: 'md' }} aria-hidden='true'>
				<FiHeart />
			</Icon>
		</ImageActionButton>
	);
}

export default function ProductCard({ product, imagePriority = false }: Props) {
	const t = useTranslations('products');
	const basePrice = roundPrice(product.basePrice ?? 0);
	const discountPrice = product.discountPrice != null ? roundPrice(product.discountPrice) : null;
	const rawDiscount = discountPrice != null ? roundPrice(basePrice - discountPrice) : 0;
	const hasDiscount = rawDiscount > 0;
	const displayPrice = hasDiscount && discountPrice != null ? discountPrice : basePrice;
	const fullSlug = product.fullSlug ?? '#';
	const name = product.name ?? '';
	const isInStock = product.inStock ?? false;
	const discount = hasDiscount ? rawDiscount : 0;
	const reviewCount = product.reviewCount ?? 0;
	const hasReviews = reviewCount > 0;
	const ratingId = useId();

	const previewImages = buildProductImageGallery(product.imageUrl, product.images, 3);

	if (!product) return null;

	return (
		<Card.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			w='full'
			h='full'
			borderWidth='1px'
			borderStyle='solid'
			borderColor='border'
			rounded='xl'
			overflow='hidden'
			bg='bg.tertiary'
			transition='box-shadow 0.2s ease-in-out'
			_hover={{
				boxShadow: {
					// Chakra's built-in shadow tokens are black-based, which barely
					// shows up against this card's already-dark bg.tertiary in dark
					// mode — use a light glow there instead so it's actually visible,
					// with a higher opacity than light mode's shadow for more presence.
					base: '0 1px 22px rgba(0, 0, 0, 0.22)',
					_dark: '0 1px 26px rgba(177, 175, 179, 0.26)',
				},
			}}
		>
			{/* Full-bleed image with floating actions/nav — the title link below
			    is the only thing that navigates, matching the earlier fix that
			    stopped image clicks from also opening the product. */}
			<Box position='relative' w='full'>
				<ProductPreviewSlider
					images={previewImages}
					productName={name}
					imagePriority={imagePriority}
				/>

				<ProductCardCartButton product={product} isInStock={isInStock} />

				<ProductCardWishlistButton product={product} />

				{!isInStock && (
					<Flex
						position='absolute'
						inset='0'
						zIndex={1}
						align='center'
						justify='center'
						bg='blackAlpha.600'
					>
						<Badge
							variant='solid'
							bg='gray.800'
							color='white'
							rounded='full'
							px='3'
							fontWeight='semibold'
						>
							{t('productIsOutOfStock')}
						</Badge>
					</Flex>
				)}
			</Box>

			<Flex
				direction='column'
				gap='2'
				p={{ base: 4, cardSm: 2.5 }}
				flex='1'
				justifyContent='space-between'
			>
				<LinkBox>
					<Card.Title fontWeight='semibold' w='100%' as='span'>
						<LocaleNavLink
							href={`/products/${fullSlug}`}
							textDecorationColor='main'
							color='main'
							fontSize={{ base: '18px', cardSm: '16px' }}
							lineHeight='1.35'
							display='-webkit-box'
							overflow='hidden'
							css={{
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
							}}
							variant='underline'
						>
							{name}
						</LocaleNavLink>
					</Card.Title>
				</LinkBox>

				<Flex align='baseline' justify='space-between' gap='2' wrap='wrap'>
					<Text
						color='main'
						fontSize={{ base: '22px', cardSm: '20px' }}
						fontWeight='semibold'
						textWrap='wrap'
						textAlign='left'
					>
						{formatUsdPrice(displayPrice)}
					</Text>
					{discount > 0 && (
						<Text
							color='main'
							fontSize={{ base: '17px', cardSm: '16px' }}
							textDecoration='line-through'
							textAlign='right'
						>
							{formatUsdPrice(basePrice)}
							<Badge
								as='span'
								variant='solid'
								color='black'
								bg='main.secondary'
								fontWeight='medium'
								textDecoration='none'
								ml='8px'
							>
								-{formatUsdPrice(discount)}
							</Badge>
						</Text>
					)}
				</Flex>

				<HStack mt='1.5' gap='2' justifyContent='flex-start' flexWrap='wrap'>
					<Rating
						id={`product-card-rating-${product.id}-${ratingId}`}
						readOnly
						size={{ base: 'sm', cardSm: 'xs' }}
						defaultValue={product.averageRating ?? 0}
					/>
					<Link
						href={`/products/${fullSlug}/?tab=feedback`}
						variant='underline'
						fontSize='15px'
						aria-label={
							hasReviews
								? `${t('feedback')} (${reviewCount}) — ${name}`
								: `${t('leaveReview')} — ${name}`
						}
						color='main'
						_focusVisible={{
							outline: '2px solid',
							outlineColor: 'main.secondary',
							outlineOffset: '2px',
						}}
					>
						{hasReviews ? `${t('feedback')} (${reviewCount})` : t('leaveReview')}
					</Link>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
