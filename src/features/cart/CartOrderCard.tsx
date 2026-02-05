import { FiTrash2 } from 'react-icons/fi';
import { Badge, Box, Card, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { StepperInput } from '@/components/ui/chakra/stepper-input';
import { useCart } from '@/hooks/useCart';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { I18nData } from '@/types/i18n';
import { CartProduct } from '@/types/cart';
import { buildProductImages } from '@/utils/productImages';

interface Props {
	product: CartProduct;
	i18nData: I18nData;
	onNavigate?: () => void;
}

export default function CartOrderCard({ product, i18nData, onNavigate }: Props) {
	const { handleRemoveLine, handleUpdateQuantity } = useCart();

	const quantity = Math.max(1, product.quantity ?? 1);
	const unitPrice = product.discountPrice ?? product.basePrice;
	const hasDiscount =
		product.discountPrice !== null &&
		product.discountPrice !== undefined &&
		product.discountPrice < product.basePrice;
	const discountAmount = hasDiscount ? product.basePrice - (product.discountPrice ?? 0) : 0;
	const lineTotal = unitPrice * quantity;
	const totalLabel = i18nData.totalAmount || 'Total';

	const previewImage =
		buildProductImages(product.imageUrl)?.[0] || product.imageUrl || '/assets/images/temp/1.webp';
	const productHref = `/products/${product.fullSlug}`;
	const handleNavigate = () => {
		if (typeof onNavigate === 'function') onNavigate();
	};

	const handleDelete = async () => {
		const result = await handleRemoveLine(product.lineId);

		if (!result.success) {
			showToaster('error', toasterMessages.cartRemoveFailed(i18nData));
		}
	};

	const handleQuantityChange = async (e: { value: number | string }) => {
		const qty = Number(e.value);
		if (Number.isFinite(qty) && qty >= 1) {
			const res = await handleUpdateQuantity(product.lineId, qty);
			if (!res.success) {
				showToaster('error', toasterMessages.cartUpdateFailed(i18nData.cartUpdateFailed));
			}
		}
	};

	return (
		<Card.Root
			w='100%'
			borderWidth='1px'
			borderColor='border'
			bg='bg.tertiary'
			rounded='lg'
			transition='all 0.2s ease-in-out'
		>
			<Flex
				p='3'
				gap='3'
				direction={{ base: 'column', sm: 'row' }}
				alignItems={{ base: 'center', sm: 'center' }}
			>
				<LocaleNavLink
					href={productHref}
					display='inline-block'
					lineHeight='0'
					mx={{ base: 0, sm: 2 }}
					alignSelf={{ base: 'center', sm: 'auto' }}
					onClick={handleNavigate}
				>
					<Box
						position='relative'
						w={{ base: '128px', sm: '106px' }}
						h={{ base: '128px', sm: '106px' }}
						borderRadius='lg'
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						overflow='hidden'
					>
						<Image
							src={previewImage}
							alt={product.name}
							fill
							sizes='(max-width: 479px) 128px, 106px'
							style={{
								objectFit: 'contain',
								paddingTop: '4px',
							}}
						/>
					</Box>
				</LocaleNavLink>

				<Flex flex='1' direction='column' minW='0' gap='3' w='full'>
					<HStack
						justifyContent={{ base: 'center', sm: 'space-between' }}
						alignItems={{ base: 'center', sm: 'flex-start' }}
						gap='3'
						w='full'
					>
						<VStack alignItems={{ base: 'center', sm: 'flex-start' }} gap='2' minW='0'>
							<Card.Title fontWeight='semibold' lineHeight='1.1'>
								<Text
									textAlign={{ base: 'center', sm: 'start' }}
									style={{
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									<LocaleNavLink
										href={productHref}
										fontSize='md'
										textDecorationColor='main'
										color='main'
										variant='underline'
										onClick={handleNavigate}
									>
										{product.name}
									</LocaleNavLink>
								</Text>
							</Card.Title>

							{product.variantLabel && (
								<Text
									color='main.disabled'
									borderColor='border'
									fontSize={{ base: '15px', sm: 'sm' }}
									textAlign={{ base: 'center', sm: 'start' }}
								>
									{product.variantLabel}
								</Text>
							)}
						</VStack>

						<IconButton
							aria-label='Remove item from cart'
							variant='outline'
							rounded='md'
							onClick={handleDelete}
							display={{ base: 'none', sm: 'inline-flex' }}
						>
							<FiTrash2 />
						</IconButton>
					</HStack>

					<Flex
						justifyContent='space-between'
						direction={{ base: 'column', sm: 'row' }}
						alignItems={{ base: 'center', sm: 'flex-end' }}
						gap='3'
						w='full'
					>
						<VStack alignItems={{ base: 'center', sm: 'flex-start' }} gap='0.5' flex='1'>
							<Text color='main' fontSize={{ base: 'md', sm: 'lg' }} fontWeight='semibold'>
								{unitPrice} ₴
								{hasDiscount && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='md'
										textDecoration='line-through'
										marginLeft='2'
									>
										{product.basePrice} ₴
										{discountAmount > 0 && (
											<Badge
												variant='solid'
												bg='bg.accent'
												color='black'
												fontWeight='bold'
												rounded='lg'
												px='2'
												ml='4'
											>
												-{discountAmount} ₴
											</Badge>
										)}
									</Text>
								)}
							</Text>

							<Text fontSize='15px' color='main.disabled' hideBelow='sm'>
								{totalLabel}: {lineTotal.toFixed(2)} ₴
							</Text>
						</VStack>

						<HStack gap={{ base: '8', sm: '2' }} alignSelf={{ base: 'center', sm: 'auto' }}>
							<StepperInput
								defaultValue={quantity.toString()}
								min={1}
								size='sm'
								aria-label='Quantity'
								onValueChange={handleQuantityChange}
							/>
							<IconButton
								aria-label='Remove item from cart'
								variant='subtle'
								rounded='md'
								onClick={handleDelete}
								display={{ base: 'inline-flex', sm: 'none' }}
							>
								<FiTrash2 />
							</IconButton>
						</HStack>
					</Flex>
				</Flex>
			</Flex>
		</Card.Root>
	);
}
