import { FiTrash2 } from 'react-icons/fi';
import { IconButton, Text, Flex, Card, Badge } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '../links/LocaleNavLink';
import { StepperInput } from '../chakra/stepper-input';
import { useCart } from '@/components/providers/useCart';
import { toaster } from '../chakra/toaster';
import { I18nData } from '@/types/i18n';
import { CartProduct } from '@/types/cart';

interface Props {
	product: CartProduct;
	i18nData: I18nData;
}

const img1 = '/assets/images/temp/1.webp';

export default function CartOrderCard({ product, i18nData }: Props) {
	const { handleRemoveItem, handleUpdateQuantity } = useCart();

	const discountAmount = product.discountPrice
		? Number(product.basePrice) - Number(product.discountPrice)
		: 0;

	const handleDelete = async () => {
		const result = await handleRemoveItem(product.id);

		if (!result.success) {
			toaster.error({
				title: i18nData.cartRemoveFailed,
				duration: 5000,
			});
		}
	};

	const handleQuantityChange = async (e: any) => {
		const qty = Number(e.value);
		if (Number.isFinite(qty) && qty >= 1) {
			const res = await handleUpdateQuantity(product.id, qty);
			if (!res.success) {
				toaster.error({ title: i18nData.cartUpdateFailed, duration: 5000 });
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
						<Image
							src={img1}
							alt={product.name}
							width={110}
							height={110}
							style={{ objectFit: 'contain', marginRight: '6px' }}
						/>
						<Flex direction='column' gap={3} pt={{ base: 2, xs: 0 } as any}>
							<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
								<LocaleNavLink
									href={`/products/${product.fullSlug}`}
									textDecorationColor='main'
									color='main'
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
						mt={{ base: 4, sm: 0 } as any}
						h={{ base: 'auto', sm: '110px' }}
						w={{ base: '100%', sm: 'auto' }}
					>
						<StepperInput
							defaultValue={product.quantity?.toString() || '1'}
							min={1}
							size='xs'
							onValueChange={handleQuantityChange}
						/>
						<IconButton
							mt='0'
							aria-label='Trash'
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
