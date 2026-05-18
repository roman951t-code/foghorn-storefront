import { Text, VStack, Card, Badge, Separator, Flex, Group, Stat, Box } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { CartProduct } from '@/types/cart';
import { resolveProductPrimaryImage } from '@/utils/productImages';
import { formatUsdPrice, roundPrice } from '@/utils/priceFormatting';

type CheckoutCardProps = {
	product: CartProduct;
	showSeparator?: boolean;
};

const XS_MEDIA_QUERY = '@media screen and (min-width: 430px)';

const getImage = (src?: string | null) => resolveProductPrimaryImage(src);

const usePriceParts = (product: CartProduct) => {
	const basePrice = roundPrice(product.basePrice ?? 0);
	const discountPrice = product.discountPrice != null ? roundPrice(product.discountPrice) : null;
	const discountAmount =
		discountPrice != null ? roundPrice(Math.max(0, basePrice - discountPrice)) : 0;
	const hasDiscount = discountAmount > 0;
	const price = hasDiscount && discountPrice != null ? discountPrice : basePrice;

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
						<Box
							position='relative'
							w={{ base: '136px', sm: '114px' }}
							h={{ base: '136px', sm: '114px' }}
							borderRadius='md'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							overflow='hidden'
						>
							<Image
								fill
								sizes='(max-width: 479px) 136px, 114px'
								src={getImage(product.imageUrl)}
								alt={product.name}
								style={{
									objectFit: 'contain',
									paddingTop: '4px',
								}}
							/>
						</Box>
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
						<Text color='main.disabled' fontSize={{ base: 'md', md: 'sm' }} mt='-2'>
							{product.variantLabel}
						</Text>
					)}
					<Text color='main' fontSize='xl'>
						{formatUsdPrice(price)}
					</Text>
					{hasDiscount && (
						<Text
							color='main.disabled'
							fontSize={{ base: 'md', md: 'sm' }}
							textDecoration='line-through'
						>
							{formatUsdPrice(product.basePrice)}
							<Badge
								variant='solid'
								color='black'
								bg='main.secondary'
								fontWeight='semibold'
								marginLeft='10px'
							>
								-{formatUsdPrice(discountAmount)}
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
				direction='column'
				p={3}
				pl='4'
				css={{
					[XS_MEDIA_QUERY]: {
						flexDirection: 'row',
						paddingLeft: 0,
					},
				}}
			>
				<Flex
					align='center'
					justifyContent='space-between'
					direction='column'
					w='full'
					css={{
						[XS_MEDIA_QUERY]: {
							flexDirection: 'row',
						},
					}}
				>
					<Flex
						alignItems='center'
						direction='column'
						w='full'
						gap={2}
						css={{
							[XS_MEDIA_QUERY]: {
								flexDirection: 'row',
							},
						}}
					>
						<LocaleNavLink
							href={productHref}
							display='inline-block'
							lineHeight='0'
							mx={0}
							css={{
								[XS_MEDIA_QUERY]: {
									marginInline: '3',
								},
							}}
						>
							<Box
								position='relative'
								w={{ base: '136px', sm: '114px' }}
								h={{ base: '136px', sm: '114px' }}
								borderRadius='md'
								borderWidth='0.5px'
								borderStyle='solid'
								borderColor='border'
								overflow='hidden'
							>
								<Image
									fill
									sizes='(max-width: 479px) 136px, 114px'
									src={getImage(product.imageUrl)}
									alt={product.name}
									style={{
										objectFit: 'contain',
										paddingTop: '4px',
									}}
								/>
							</Box>
						</LocaleNavLink>
						<Flex
							direction='column'
							gap={3}
							pt={2}
							w='full'
							minW={0}
							css={{
								[XS_MEDIA_QUERY]: {
									paddingTop: 0,
								},
							}}
						>
							<Card.Title
								fontWeight='medium'
								lineHeight='24px'
								textAlign='center'
								css={{
									[XS_MEDIA_QUERY]: {
										textAlign: 'left',
									},
								}}
							>
								<LocaleNavLink
									href={productHref}
									textDecorationColor='main'
									color='main'
									fontSize='lg'
									variant='underline'
								>
									{product.name}
								</LocaleNavLink>
							</Card.Title>
							{product.variantLabel && (
								<Text
									textAlign='center'
									color='main.disabled'
									borderColor='border'
									fontSize={{ base: 'md', md: 'sm' }}
									mt='-1'
									css={{
										[XS_MEDIA_QUERY]: {
											textAlign: 'left',
										},
									}}
								>
									{product.variantLabel}
								</Text>
							)}
							<Text
								color='main'
								fontSize='xl'
								fontWeight='medium'
								textAlign='center'
								mb={4}
								mr={0}
								css={{
									[XS_MEDIA_QUERY]: {
										textAlign: 'left',
										marginBottom: 0,
										marginRight: '2',
									},
								}}
							>
								{formatUsdPrice(price)}
								{hasDiscount && (
									<Text
										as='span'
										color='main.disabled'
										fontSize={{ base: 'md', md: 'sm' }}
										textDecoration='line-through'
										marginLeft='2'
									>
										{formatUsdPrice(product.basePrice)}
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
										-{formatUsdPrice(discountAmount)}
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>

					<Flex
						alignSelf='center'
						mt={2}
						css={{
							[XS_MEDIA_QUERY]: {
								alignSelf: 'flex-end',
								marginTop: 0,
							},
						}}
					>
						<Stat.Root color='main'>
							<Stat.ValueText textStyle='md' minW='46px'>
								{`x ${quantity}${t('units')}`}
							</Stat.ValueText>
						</Stat.Root>
					</Flex>
				</Flex>
			</Flex>

			{showSeparator && <Separator color='border' />}
		</Card.Root>
	);
}
