import { Text, VStack, Card, Badge, Separator, Flex, Group, Stat } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { CartProduct } from '@/types/cart';
import { buildProductImages } from '@/utils/productImages';

type CheckoutCardProps = {
	product: CartProduct;
	showSeparator?: boolean;
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

export function SidebarCheckoutCard({ product, showSeparator = true }: CheckoutCardProps) {
	const t = useTranslations('common');
	const { price, hasDiscount, discountAmount } = usePriceParts(product);
	const quantity = Math.max(1, product.quantity ?? 1);
	const productHref = `/products/${product.fullSlug}`;

	return (
		<Card.Root p='4' gap={4} py={1} border='none' bg='none'>
			<Group p='0'>
				<VStack mr='1'>
					<LocaleNavLink href={productHref} display='inline-block' lineHeight='0'>
						<Image
							style={{
								borderRadius: '6px',
								border: '0.5px solid var(--chakra-colors-border)',
							}}
							width={100}
							height={100}
							src={getImage(product.imageUrl)}
							alt={product.name}
						/>
					</LocaleNavLink>
					<Text as='span' textStyle='md' minW='56px' fontWeight='semibold'>
						{`x ${quantity}${t('units')}`}
					</Text>
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
					{product.variantLabel && (
						<Text color='main.disabled' fontSize='sm' mt='-2'>
							{product.variantLabel}
						</Text>
					)}
					<Text color='main' fontSize='xl'>
						{price} ₴
					</Text>
					{hasDiscount && (
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							{product.basePrice} ₴
							<Badge
								variant='solid'
								color='black'
								bg='main.secondary'
								fontWeight='semibold'
								marginLeft='10px'
							>
								- {discountAmount}₴
							</Badge>
						</Text>
					)}
				</VStack>
			</Group>

			{showSeparator && <Separator mb='2' color='border' />}
		</Card.Root>
	);
}

export function FullCheckoutCard({ product, showSeparator = true }: CheckoutCardProps) {
	const t = useTranslations('common');
	const { price, hasDiscount, discountAmount } = usePriceParts(product);
	const quantity = Math.max(1, product.quantity ?? 1);
	const productHref = `/products/${product.fullSlug}`;

	return (
		<Card.Root minWidth='200px' w='100%' border='none' bg='none' transition='all 0.25s ease-in-out'>
			<Flex
				align='center'
				justifyContent='space-between'
				direction={{ base: 'column', xs: 'row' } as any}
				p={3}
				pl={{ base: '4', xs: 0 } as any}
			>
				<Flex
					align='center'
					justifyContent='space-between'
					direction={{ base: 'column', xs: 'row' } as any}
					w='full'
				>
					<Flex
						alignItems={{ base: 'center', xs: 'center' } as any}
						direction={{ base: 'column', xs: 'row' } as any}
						w='full'
						gap={{ base: 2, xs: 2 } as any}
					>
						<LocaleNavLink
							href={productHref}
							display='inline-block'
							lineHeight='0'
							mx={{ base: 0, xs: 3 } as any}
						>
							<Image
								width={112}
								height={112}
								src={getImage(product.imageUrl)}
								style={{
									objectFit: 'contain',
									borderRadius: '6px',
									marginLeft: '4px',
									border: '0.5px solid var(--chakra-colors-border)',
								}}
								alt={product.name}
							/>
						</LocaleNavLink>
						<Flex direction='column' gap={3} pt={{ base: 2, xs: 0 } as any} w='full' minW={0}>
							<Card.Title
								fontWeight='medium'
								lineHeight='24px'
								textAlign={{ base: 'center', xs: 'left' } as any}
							>
								<LocaleNavLink
									href={productHref}
									textDecorationColor='main'
									color='main'
									fontSize={{ base: 'lg', xs: '17px' } as any}
									variant='underline'
								>
									{product.name}
								</LocaleNavLink>
							</Card.Title>
							{product.variantLabel && (
								<Text
									textAlign={{ base: 'center', xs: 'left' } as any}
									color='main.disabled'
									borderColor='border'
									fontSize='sm'
									mt='-1'
								>
									{product.variantLabel}
								</Text>
							)}
							<Text
								color='main'
								fontSize='xl'
								fontWeight='medium'
								textAlign={{ base: 'center', xs: 'left' } as any}
								mb={{ base: 4, xs: 0 } as any}
								mr={{ base: 0, xs: 2 } as any}
							>
								{price} ₴
								{hasDiscount && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='2'
									>
										{product.basePrice} ₴
									</Text>
								)}
								{hasDiscount && (
									<Badge
										variant='solid'
										color='black'
										bg='main.secondary'
										fontWeight='semibold'
										ml='8px'
									>
										-{discountAmount} ₴
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>

					<Flex
						alignSelf={{ base: 'center', xs: 'flex-end' } as any}
						mt={{ base: 2, xs: 0 } as any}
					>
						<Stat.Root color='main'>
							<Stat.ValueText textStyle='md' minW='42px'>
								{`x ${quantity}${t('units')}`}
							</Stat.ValueText>
						</Stat.Root>
					</Flex>
				</Flex>
			</Flex>

			{showSeparator && <Separator mb='4' color='border' />}
		</Card.Root>
	);
}
