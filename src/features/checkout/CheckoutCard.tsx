import { Text, VStack, Card, Badge, Separator, Flex, Group, Stat } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { CartProduct } from '@/types/cart';
import { buildProductImages } from '@/utils/productImages';

type CheckoutCardProps = {
	product: CartProduct;
};

const getImage = (src?: string | null) =>
	buildProductImages(src)?.[0] || src || '/assets/images/temp/1.webp';

const usePriceParts = (product: CartProduct) => {
	const price = product.discountPrice ?? product.basePrice;
	const hasDiscount =
		product.discountPrice !== null &&
		product.discountPrice !== undefined &&
		product.discountPrice < product.basePrice;
	const discountAmount = hasDiscount ? product.basePrice - (product.discountPrice ?? 0) : 0;

	return { price, hasDiscount, discountAmount };
};

export function SidebarCheckoutCard({ product }: CheckoutCardProps) {
	const t = useTranslations('common');
	const { price, hasDiscount, discountAmount } = usePriceParts(product);
	const quantity = Math.max(1, product.quantity ?? 1);
	const productHref = `/products/${product.fullSlug}`;

	return (
		<Card.Root p='4' gap={4} py={1} border='none' bg='bg.tertiary'>
			<Group p='0'>
				<VStack mr='1'>
					<LocaleNavLink href={productHref} display='inline-block' lineHeight='0'>
						<Image
							style={{ borderRadius: '6px' }}
							width={100}
							height={100}
							src={getImage(product.imageUrl)}
							alt={product.name}
						/>
					</LocaleNavLink>
					<Stat.Root>
						<Stat.ValueText textStyle='md' minW='42px'>
							{`x ${quantity}${t('units')}`}
						</Stat.ValueText>
					</Stat.Root>
				</VStack>

				<VStack alignItems='flex-start' mt='-2'>
					<Card.Title fontWeight='medium' fontSize='md' lineHeight='1.6'>
						<LocaleNavLink
							href={productHref}
							textDecorationColor='main'
							color='main'
							variant='underline'
						>
							{product.name}
						</LocaleNavLink>
					</Card.Title>
					<Text color='main' fontSize='xl'>
						{price} ₴
					</Text>
					{hasDiscount && (
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							{product.basePrice} ₴
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='10px'>
								- {discountAmount}₴
							</Badge>
						</Text>
					)}
				</VStack>
			</Group>

			<Separator mb='2' color='border.dark' />
		</Card.Root>
	);
}

export function FullCheckoutCard({ product }: CheckoutCardProps) {
	const t = useTranslations('common');
	const { price, hasDiscount, discountAmount } = usePriceParts(product);
	const quantity = Math.max(1, product.quantity ?? 1);
	const productHref = `/products/${product.fullSlug}`;

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='none'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
		>
			<Flex
				align='center'
				justifyContent='space-between'
				direction={{ base: 'column', sm: 'row' }}
				p={3}
				pl={0}
			>
				<Flex
					align='center'
					justifyContent='space-between'
					direction={{ base: 'column', sm: 'row' }}
					w='full'
				>
					<Flex alignItems='center' direction='row' w='full' gapX='2'>
						<LocaleNavLink href={productHref} display='inline-block' lineHeight='0' mx='3'>
							<Image
								width={110}
								height={110}
								src={getImage(product.imageUrl)}
								style={{ objectFit: 'contain', borderRadius: '6px', marginLeft: '4px' }}
								alt={product.name}
							/>
						</LocaleNavLink>
						<Flex direction='column' gap={3} pt={{ base: 2, sm: 0 }}>
							<Card.Title fontWeight='medium' lineHeight='24px'>
								<LocaleNavLink
									href={productHref}
									textDecorationColor='main'
									color='main'
									fontSize='17px'
									variant='underline'
								>
									{product.name}
								</LocaleNavLink>
							</Card.Title>
							<Text
								color='main'
								fontSize='xl'
								fontWeight='medium'
								mb={{ base: 4, sm: 0 }}
								mr={{ base: 0, sm: 2 }}
							>
								{price} ₴
								{hasDiscount && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='3'
									>
										{product.basePrice} ₴
									</Text>
								)}
								{hasDiscount && (
									<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='4'>
										-{discountAmount} ₴
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>

					<Flex alignSelf='flex-end'>
						<Stat.Root color='main'>
							<Stat.ValueText textStyle='md' minW='42px'>
								{`x ${quantity}${t('units')}`}
							</Stat.ValueText>
						</Stat.Root>
					</Flex>
				</Flex>
			</Flex>

			<Separator mb='4' color='border.dark' />
		</Card.Root>
	);
}
