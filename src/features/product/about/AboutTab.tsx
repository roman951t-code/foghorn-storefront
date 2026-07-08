import ProductThumbsSlider from '@/features/product/slider/ProductThumbsSlider';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
	Heading,
	Box,
	Group,
	HStack,
	Link,
	Badge,
	VStack,
	Flex,
	Tag,
	Status,
	Icon,
	Card,
	Text,
} from '@chakra-ui/react';
import { MdOutlineManageSearch } from 'react-icons/md';
import { RiPaypalFill, RiMoneyDollarCircleFill, RiBankCardFill } from 'react-icons/ri';
import { FaTruck } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { Rating } from '@/components/ui/chakra/rating';
import { LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import AddToFavourite from './AddToFavourite';
import AddToCartButton from './AddToCartButton';
import { Product } from '@/types/product';
import { buildProductImageGallery } from '@/utils/productImages';
import { formatUsdPrice, roundPrice } from '@/utils/priceFormatting';
import ProductDetails, { DetailOption } from './ProductDetails';
import { VariantSelector } from './VariantSelector';

const ShareProduct = dynamic(() => import('./ShareProduct'), { ssr: false });

interface Props {
	product: NonNullable<Product>;
	category: string;
	subcategory: string;
	averageRating: number;
	reviewCount: number;
	initialImageIndex?: number;
	onTabChange?: (tab: 'about' | 'characteristics' | 'feedback') => void;
}

export default function AboutTab({
	product,
	category,
	subcategory,
	averageRating,
	reviewCount,
	initialImageIndex = 0,
	onTabChange,
}: Props) {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');
	const wishT = useTranslations('wishlist');
	const checkoutT = useTranslations('checkout');

	const shareI18nData = {
		productTitle: product.name,
		pressToCopy: prodT('pressToCopy'),
		shareProductText: prodT('shareProductText'),
		shareSocial: prodT('shareSocial'),
	};

	const cartI18nData = {
		cart: cartT('cart'),
		emptyCart: cartT('emptyCart'),
		emptyCartDescr: cartT('emptyCartDescr'),
		order: navT('header.order'),
		totalAmount: prodT('totalAmount'),
		numOfProducts: prodT('numOfProducts'),
		buyText: cartT('buy'),
		productInCartText: cartT('productIsInCart'),
		cartUpdateFailed: cartT('cartUpdateFailed'),
	};

	const variants = useMemo(() => product.variants ?? [], [product.variants]);
	const initialVariantId = variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? null;
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariantId);

	const selectedVariant = useMemo(() => {
		if (!variants.length) return null;
		return (
			(selectedVariantId ? variants.find((v) => v.id === selectedVariantId) : null) ??
			variants.find((v) => v.stock > 0) ??
			variants[0]
		);
	}, [selectedVariantId, variants]);

	const selectedInStock = selectedVariant ? selectedVariant.stock > 0 : product.inStock;

	const unitBasePrice = roundPrice(selectedVariant?.price ?? product.basePrice);
	const unitDiscountPrice =
		selectedVariant?.discountPrice != null
			? roundPrice(selectedVariant.discountPrice)
			: selectedVariant
				? null
				: product.discountPrice != null
					? roundPrice(product.discountPrice)
					: null;
	const unitEffectivePrice = unitDiscountPrice ?? unitBasePrice;
	const discount =
		unitDiscountPrice != null ? roundPrice(Math.max(0, unitBasePrice - unitDiscountPrice)) : 0;

	const galleryImages = buildProductImageGallery(product.imageUrl, product.images, 4);
	const hasReviews = reviewCount > 0;

	const paymentOptions: DetailOption[] = [
		{ key: 'paypal', label: checkoutT('payment.paypal'), icon: <RiPaypalFill /> },
		{ key: 'cod', label: checkoutT('payment.cod'), icon: <RiMoneyDollarCircleFill /> },
		{ key: 'card', label: checkoutT('payment.card'), icon: <RiBankCardFill /> },
	];

	const shipmentOptions: DetailOption[] = [
		{ key: 'novaPoshta', label: checkoutT('shipment.novaPoshta'), icon: <FaTruck /> },
		{ key: 'ukrposhta', label: checkoutT('shipment.ukrposhta'), icon: <FaTruck /> },
		{ key: 'meest', label: checkoutT('shipment.meest'), icon: <FaTruck /> },
	];

	return (
		<VStack gap='8' colorPalette='gray' w='100%' alignItems='stretch'>
			<Group
				align={{ base: 'center', xl: 'flex-start' }}
				flexDirection={{ base: 'column', xl: 'row' }}
				gap='8'
				w='100%'
			>
				<Box
					maxW={{ base: '100%', md: '100%', lg: '828px', xl: '690px' }}
					minW={{ base: '0', md: '634px', lg: '828px', xl: '690px' }}
					w='full'
					bg='bg.tertiary'
					mb='4'
					rounded='lg'
				>
					<ProductThumbsSlider
						images={galleryImages}
						productName={product.name}
						initialIndex={initialImageIndex}
					/>
				</Box>
				<VStack w='full' gap='2' alignItems='flex-start'>
					<Heading as='h1' size={{ base: '2xl', sm: '3xl' }} fontWeight='medium'>
						{product.name}
					</Heading>
					<Flex
						w='100%'
						justifyContent='space-between'
						align-items='center'
						flexWrap='wrap'
						mt='2'
						gap='2'
					>
						<HStack>
							<Status.Root size={'lg'} mr='4'>
								<Status.Indicator colorPalette={selectedInStock ? 'green' : 'red'} />
								{selectedInStock ? prodT('productIsPresent') : prodT('productIsOutOfStock')}
							</Status.Root>
							<ShareProduct i18nData={shareI18nData} />
							<AddToFavourite
								wishlistUpdateFailed={wishT('wishlistUpdateFailed')}
								product={product}
							/>
						</HStack>

						<Tag.Root
							variant='surface'
							borderWidth='0.5px'
							boxShadow='none'
							bg='bg.tertiary'
							borderColor='border'
							size='lg'
							color='main'
							mr='1'
						>
							<Tag.Label>
								{prodT('productCode')}: {product.productCode}
							</Tag.Label>
						</Tag.Root>
					</Flex>
					{variants.length > 0 && (
						<VariantSelector
							variants={variants}
							value={selectedVariant?.id ?? null}
							onChange={(id) => setSelectedVariantId(id)}
						/>
					)}
					<HStack mt='4' alignItems='center' fontSize='2xl' fontWeight='semibold'>
						{formatUsdPrice(unitEffectivePrice)}
						{discount > 0 && (
							<Badge colorPalette='gray' bg='transparent' mt='1'>
								<Box
									as='span'
									color='main'
									fontSize={{ base: 'md', md: 'sm' }}
									textDecoration='line-through'
								>
									{formatUsdPrice(unitBasePrice)}
									<Badge
										variant='solid'
										fontWeight='medium'
										color='black'
										bg='main.secondary'
										marginLeft='12px'
									>
										-{formatUsdPrice(discount)}
									</Badge>
								</Box>
							</Badge>
						)}
					</HStack>

					<HStack gap='4'>
						<Rating
							id={`about-rating-${product.id}`}
							colorPalette={{ base: 'orange', _dark: 'yellow' }}
							readOnly
							allowHalf
							size='xs'
							value={averageRating}
						/>

						<Link
							href={`/products/${product.fullSlug}?tab=feedback`}
							variant='underline'
							fontSize={{ base: 'md', md: 'sm' }}
							color='main'
							_focusVisible={{
								outline: '2px solid',
								outlineColor: 'main.secondary',
								outlineOffset: '2px',
							}}
							onClick={(e) => {
								if (onTabChange) {
									e.preventDefault();
									onTabChange('feedback');
								}
							}}
						>
							{hasReviews ? `${prodT('feedback')} (${reviewCount})` : prodT('leaveReview')}
						</Link>
					</HStack>
					<Box mt='4'>
						{selectedInStock ? (
							<AddToCartButton
								i18nData={cartI18nData}
								product={product}
								variantId={selectedVariant?.id ?? null}
							/>
						) : (
							<LocaleNavButton
								href={`/products/${category}/${subcategory}?search=similar`}
								w='200px'
							>
								<Icon size='lg'>
									<MdOutlineManageSearch />
								</Icon>
								{prodT('lookSimilar')}
							</LocaleNavButton>
						)}
					</Box>

					<ProductDetails
						paymentTitle={prodT('payment')}
						shipmentTitle={prodT('shipment')}
						guaranteeTitle={prodT('guarantee')}
						guaranteeText={product.guarantee?.trim() || prodT('guaranteeText')}
						paymentOptions={paymentOptions}
						shipmentOptions={shipmentOptions}
					/>
				</VStack>
			</Group>
			<Card.Root size='sm' bg='bg.tertiary' borderColor='border' w='100%'>
				<Card.Header>
					<Heading size='md'>{prodT('description')}</Heading>
				</Card.Header>
				<Card.Body>
					<Text fontSize='sm' whiteSpace='pre-line'>
						{product.description?.trim() || prodT('descriptionText')}
					</Text>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
}
