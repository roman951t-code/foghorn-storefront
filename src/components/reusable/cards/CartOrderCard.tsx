import React from 'react';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import { IconButton, Text, Flex, Card, Badge, Group } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '../links/LocaleNavLink';
import { StepperInput } from '../chakra/stepper-input';
import { useCart } from '@/components/providers/CartProvider';
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
					pl={{ base: 3, sm: 0 }}
					w='full'
				>
					<Flex
						order={{ base: 0, sm: 1 }}
						direction={{ base: 'row', sm: 'column' }}
						justifyContent='space-between'
						alignItems={{ base: 'center', sm: 'flex-end' }}
						h={{ base: 'auto', sm: '130px' }}
						w={{ base: '100%', sm: 'auto' }}
					>
						<Group mt='0'>
							<IconButton
								aria-label='Favourite'
								variant='ghost'
								rounded='full'
								colorPalette='red'
								color='colorPalette.400'
								transition='all 0.2s ease-in-out'
								_hover={{
									bg: 'colorPalette.400',
									color: 'main.lightOnly',
								}}
							>
								<FiHeart />
							</IconButton>
							<IconButton
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
						</Group>
						<StepperInput
							defaultValue={product.quantity?.toString() || '1'}
							min={1}
							size='xs'
							onValueChange={handleQuantityChange}
						/>
					</Flex>

					<Flex
						order={{ base: 1, sm: 0 }}
						alignItems='center'
						direction={{ base: 'column', sm: 'row' }}
						w='100%'
					>
						<Image
							src={img1}
							alt={product.name}
							width={110}
							height={110}
							style={{ objectFit: 'contain', marginRight: '6px' }}
						/>
						<Flex direction='column' gap={3} pt={{ base: 2, sm: 0 }}>
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
							<Text color='main' fontSize='xl' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
								{product.discountPrice ? product.discountPrice : product.basePrice} ₴
								{product.discountPrice && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='8px'
									>
										{product.basePrice} ₴
									</Text>
								)}
								{discountAmount > 0 && (
									<Badge
										variant='solid'
										color='main.lightOnly'
										bg='main.tertiary'
										marginLeft='12px'
									>
										-{discountAmount} ₴
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Card.Root>
	);
}
