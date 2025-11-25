import ProductThumbsSlider from '@/components/reusable/slider/ProductThumbsSlider';
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
	Card,
	Stack,
	Separator,
	Stat,
	Status,
	Icon,
} from '@chakra-ui/react';
import { MdOutlineManageSearch } from 'react-icons/md';
import ShareProduct from './ShareProduct';
import { Rating } from '../../reusable/chakra/rating';
import { LocaleNavButton } from '../../reusable/links/LocaleNavLink';
import AddToFavourite from './AddToFavourite';
import AddToCartButton from './AddToCartButton';
import { Product } from '@/types/product';

interface Props {
	product: Product;
	category: string;
	subcategory: string;
	averageRating: number;
}

export default function AboutTab({ product, category, subcategory, averageRating }: Props) {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');
	const wishT = useTranslations('wishlist');

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

	const discount = product?.discountPrice ? product.basePrice - product?.discountPrice : 0;

	if (!product) return null;

	return (
		<VStack gap='8' colorPalette='gray'>
			<Group
				align={{ base: 'center', lg: 'flex-start' }}
				flexDirection={{ base: 'column', lg: 'row' }}
				gap='8'
			>
				<Box
					maxW={{ base: '90vw', md: '86vw', lg: '600px' }}
					minW={{ base: '340px', md: '440px', lg: '500px' }}
					w='100%'
					bg='bg.tertiary'
					pb='4'
					rounded='md'
				>
					<ProductThumbsSlider />
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
					<Stat.Root my='3'>
						<Flex flexWrap='wrap' alignItems='center' gap='4'>
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

							<Stat.ValueText w='auto' fontSize='3xl'>
								{product?.discountPrice ?? product.basePrice} ₴
							</Stat.ValueText>

							{discount > 0 && (
								<Badge colorPalette='gray'>
									<Box
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='1'
									>
										{parseInt(product.basePrice.toFixed(2))}₴
										<Badge
											variant='solid'
											color='main.lightOnly'
											bg='main.tertiary'
											marginLeft='12px'
										>
											- {parseInt(discount.toFixed(2))}₴
										</Badge>
									</Box>
								</Badge>
							)}
						</Flex>
					</Stat.Root>

					<HStack gap='4'>
						<Rating
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
						>
							{prodT('feedback')} ({product.reviewCount ?? 0})
						</Link>
					</HStack>
					<Stack w='100%' gap='4' mt='6'>
						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> Секция плейсхолдер</Heading>
							</Card.Header>
							<Card.Body>
								Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
								Ipsum has been the industry's standard dummy text ever since the 1500s, when an
								unknown printer took a galley of type and scrambled it to make a type specimen book.
							</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {prodT('payment')}</Heading>
							</Card.Header>
							<Card.Body>
								Картою онлайн, Оплата під час отримання товару, Оплата карткою у відділенні, Apple
								Pay, Google Pay, Безготівковими для юридичних осіб, Безготівковий для фізичних осіб
							</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {prodT('shipment')}</Heading>
							</Card.Header>
							<Card.Body>Доставка кур'єром Нової Пошти</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {prodT('guarantee')}</Heading>
							</Card.Header>
							<Card.Body>
								Законом про захист прав споживачів не передбачено повернення цього товару належної
								якості.
							</Card.Body>
						</Card.Root>
					</Stack>
				</VStack>
			</Group>
			<Separator borderColor='border.dark' />
			<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
				<Card.Header>
					<Heading size='lg'> {prodT('description')}</Heading>
				</Card.Header>
				<Card.Body>
					It has survived not only five centuries, but also the leap into electronic typesetting,
					remaining essentially unchanged. It was popularised in the 1960s with the release of
					Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
					software like Aldus PageMaker including versions of Lorem Ipsum.
				</Card.Body>
			</Card.Root>
		</VStack>
	);
}
