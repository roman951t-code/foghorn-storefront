import ProductThumbsSlider from '@/features/product/slider/ProductThumbsSlider';
import { useTranslations } from 'next-intl';
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
import { buildProductImages } from '@/utils/productImages';
import ProductDetails, { DetailOption } from './ProductDetails';

const ShareProduct = dynamic(() => import('./ShareProduct'), { ssr: false });

interface Props {
	product: NonNullable<Product>;
	category: string;
	subcategory: string;
	averageRating: number;
	onTabChange?: (tab: 'about' | 'characteristics' | 'feedback') => void;
}

export default function AboutTab({
	product,
	category,
	subcategory,
	averageRating,
	onTabChange,
}: Props) {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');
	const wishT = useTranslations('wishlist');
	const checkoutT = useTranslations('checkout');

	const shareI18nData = {
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

	const discount = product.discountPrice ? product.basePrice - product.discountPrice : 0;
	const galleryImages =
		product.images && product.images.length > 0
			? product.images
			: buildProductImages(product.imageUrl ?? undefined, 4);

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
		<VStack gap='8' colorPalette='gray' userSelect='none'>
			<Group
				align={{ base: 'center', lg: 'flex-start' }}
				flexDirection={{ base: 'column', lg: 'row' }}
				gap='8'
			>
				<Box
					maxW={{ base: '90vw', md: '86vw', lg: '600px' }}
					minW={{ base: '340px', md: '440px', lg: '500px' }}
					w='full'
					bg='bg.tertiary'
					mb='4'
					rounded='md'
				>
					<ProductThumbsSlider images={galleryImages} productName={product.name} />
				</Box>
				<VStack gap='2' alignItems='flex-start'>
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
								<Status.Indicator colorPalette={product.inStock ? 'green' : 'red'} />
								{product.inStock ? prodT('productIsPresent') : prodT('productIsOutOfStock')}
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
							borderColor='border.light'
							size='lg'
							color='main'
							mr='1'
						>
							<Tag.Label>
								{prodT('productCode')}: {product.productCode}
							</Tag.Label>
						</Tag.Root>
					</Flex>
					<Flex flexWrap='wrap' alignItems='center' gap='4' my='3'>
						{product.inStock ? (
							<AddToCartButton i18nData={cartI18nData} product={product} />
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

						<Box as='span' fontSize='3xl' fontWeight='semibold'>
							{product?.discountPrice ?? product.basePrice} ₴
						</Box>

						{discount > 0 && (
							<Badge colorPalette='gray'>
								<Box as='span' color='main' fontSize='sm' textDecoration='line-through'>
									{parseInt(product.basePrice.toFixed(2))}₴
									<Badge variant='solid' color='black' bg='main.secondary' marginLeft='12px'>
										- {parseInt(discount.toFixed(2))}₴
									</Badge>
								</Box>
							</Badge>
						)}
					</Flex>

					<HStack gap='4'>
						<Rating
							id={`about-rating-${product.id}`}
							colorPalette={{ base: 'orange', _dark: 'yellow' }}
							readOnly
							size='xs'
							defaultValue={averageRating}
						/>

						<Link
							href={`/products/${product.fullSlug}?tab=feedback`}
							variant='underline'
							fontSize='sm'
							color='main'
							_focus={{ outline: 'none' }}
							onClick={(e) => {
								if (onTabChange) {
									e.preventDefault();
									onTabChange('feedback');
								}
							}}
						>
							{prodT('feedback')} ({product.reviewCount ?? 0})
						</Link>
					</HStack>
					<ProductDetails
						paymentTitle={prodT('payment')}
						shipmentTitle={prodT('shipment')}
						guaranteeTitle={prodT('guarantee')}
						descriptionTitle={prodT('description')}
						guaranteeText={prodT('guaranteeText')}
						descriptionText={prodT('descriptionText')}
						paymentOptions={paymentOptions}
						shipmentOptions={shipmentOptions}
					/>
				</VStack>
			</Group>
		</VStack>
	);
}
