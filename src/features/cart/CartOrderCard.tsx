import { FiTrash2 } from 'react-icons/fi';
import { IconButton, Text, Flex, Card, Badge } from '@chakra-ui/react';
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
	const { handleRemoveItem, handleUpdateQuantity } = useCart();

	const discountAmount = product.discountPrice
		? Number(product.basePrice) - Number(product.discountPrice)
		: 0;
	const previewImage =
		buildProductImages(product.imageUrl)?.[0] || product.imageUrl || '/assets/images/temp/1.webp';
	const productHref = `/products/${product.fullSlug}`;
	const handleNavigate = () => {
		if (typeof onNavigate === 'function') onNavigate();
	};

	const handleDelete = async () => {
		const result = await handleRemoveItem(product.id);

		if (!result.success) {
			showToaster('error', toasterMessages.cartRemoveFailed(i18nData));
		}
	};

	const handleQuantityChange = async (e: { value: number | string }) => {
		const qty = Number(e.value);
		if (Number.isFinite(qty) && qty >= 1) {
			const res = await handleUpdateQuantity(product.id, qty);
			if (!res.success) {
				showToaster('error', toasterMessages.cartUpdateFailed(i18nData.cartUpdateFailed));
			}
		}
	};

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
		>
			<Flex
				align='center'
				justifyContent='space-between'
				direction={{ base: 'column', sm: 'row' }}
				p={3}
				pl={{ base: 3, sm: 0 }}
			>
				<Flex
					align='center'
					justifyContent='space-between'
					direction={{ base: 'column', sm: 'row' }}
					w='full'
				>
					<Flex alignItems='center' direction='row' w='100%'>
						<LocaleNavLink
							href={productHref}
							display='inline-block'
							lineHeight='0'
							mx='4'
							onClick={handleNavigate}
						>
							<Image
								src={previewImage}
								alt={product.name}
								width={110}
								height={110}
								style={{ objectFit: 'contain', borderRadius: '6px' }}
							/>
						</LocaleNavLink>
						<Flex direction='column' gap={3} pt={{ base: 2, sm: 0 }}>
							<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
								<LocaleNavLink
									href={productHref}
									textDecorationColor='main'
									color='main'
									variant='underline'
									onClick={handleNavigate}
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
								{product.discountPrice ? product.discountPrice : product.basePrice} ₴
								{product.discountPrice && (
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
								{discountAmount > 0 && (
									<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='4'>
										-{discountAmount} ₴
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>

					<Flex
						order={{ base: 1, sm: 0 }}
						direction={{ base: 'row', sm: 'column' }}
						justifyContent='space-between'
						alignItems={{ base: 'center', sm: 'flex-end' }}
						mt={{ base: 4, sm: 0 } as const}
						h={{ base: 'auto', sm: '110px' }}
						w={{ base: '100%', sm: 'auto' }}
					>
						<StepperInput
							defaultValue={product.quantity?.toString() || '1'}
							min={1}
							size='xs'
							aria-label='Quantity'
							onValueChange={handleQuantityChange}
						/>
						<IconButton
							mt='0'
							aria-label='Remove item from cart'
							variant='ghost'
							rounded='full'
							color='main.disabled'
							transition='all 0.2s ease-in-out'
							_hover={{
								bg: 'colorPalette.500',
								color: 'main.lightOnly',
							}}
							onClick={handleDelete}
						>
							<FiTrash2 />
						</IconButton>
					</Flex>
				</Flex>
			</Flex>
		</Card.Root>
	);
}
