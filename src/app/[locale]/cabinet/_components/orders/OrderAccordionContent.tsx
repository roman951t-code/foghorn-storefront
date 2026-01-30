'use client';

import { useTransition } from 'react';
import { Accordion, Card, Flex, Separator, Stack, Text } from '@chakra-ui/react';
import { BsArrowRepeat } from 'react-icons/bs';
import { useTranslations } from 'next-intl';
import { PrimaryButton, TertiaryButton } from '@/components/ui/buttons/ActionButton';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { buildProductImages, toPreviewImage } from '@/utils/productImages';
import { repeatOrderAction } from '@/actions/repeatOrderAction';
import { useCartStore } from '@/stores/cartStore';
import { showToaster } from '@/utils/toast';
import Image from 'next/image';
import type { UserOrder } from '@/types/order';
import { useRouter } from 'next/navigation';
import { deleteOrderAction } from '@/actions/deleteOrderAction';

type Props = {
	order: UserOrder;
};

export function OrderAccordionContent({ order }: Props) {
	const productsT = useTranslations('products');
	const ordersT = useTranslations('orders');
	const commonT = useTranslations('common');
	const setCartItems = useCartStore((state) => state.setCartItems);
	const [isRepeating, startRepeatTransition] = useTransition();
	const [isDeleting, startDeleteTransition] = useTransition();
	const router = useRouter();
	const isPendingStatus = (order.status ?? '').toLowerCase() === 'pending';
	const deleteLabel = isPendingStatus ? ordersT('cancelOrder') : ordersT('deleteOrder');

	const handleRepeatOrder = () => {
		startRepeatTransition(async () => {
			const result = await repeatOrderAction(order.id);

			if (result.success) {
				setCartItems(result.items);
				showToaster('success', ordersT('repeatSuccess'));
				return;
			}

			const errorKey =
				result.code === 'unauthorized'
					? 'repeatUnauthorized'
					: result.code === 'not-found'
					? 'repeatNotFound'
					: result.code === 'empty'
					? 'repeatEmpty'
					: 'repeatFailed';

			showToaster('error', ordersT(errorKey));
		});
	};

	const handleDeleteOrder = () => {
		startDeleteTransition(async () => {
			const result = await deleteOrderAction(order.id);

			if (result.success) {
				showToaster('success', ordersT('orderDeleteSuccess'));
				router.refresh();
			} else {
				const key =
					result.code === 'unauthorized' ? 'orderDeleteUnauthorized' : 'orderDeleteFailed';
				showToaster('error', ordersT(key));
			}
		});
	};

	return (
		<Accordion.ItemContent>
			<Accordion.ItemBody p='0' pt='4' mt='2'>
				<Flex
					justifyContent={{ base: 'space-between', xs: 'space-between' } as any}
					alignItems='center'
					gap='3'
					flexWrap='wrap'
					mb='4'
				>
					<TertiaryButton onClick={handleDeleteOrder} loading={isDeleting} disabled={isDeleting}>
						{deleteLabel}
					</TertiaryButton>
					<PrimaryButton onClick={handleRepeatOrder} loading={isRepeating}>
						<BsArrowRepeat />
						{productsT('repeatOrder')}
					</PrimaryButton>
				</Flex>
				<Separator mt='4' mb='6' color='border' />
				<Stack maxH='510px' overflowY='auto'>
					{order.items.map((item, idx) => {
						const previewImage = toPreviewImage(
							buildProductImages(item.product.imageUrl, 1)[0] || '/assets/images/temp/1.webp'
						);

						return (
							<div key={item.id}>
								<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} gap='3'>
									<LocaleNavLink href={`/products/${item.product.fullSlug}`} mr='2'>
											<Image
												width={110}
												height={110}
												src={previewImage}
												alt={item.product.name}
												style={{
													objectFit: 'contain',
													borderRadius: '6px',
													border: '0.5px solid var(--chakra-colors-border)',
												}}
											/>
										</LocaleNavLink>

									<Flex
										direction='column'
										gap={2}
										w='full'
										textAlign={{ base: 'center', sm: 'left' }}
									>
										<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
											<LocaleNavLink
												href={`/products/${item.product.fullSlug}`}
												textDecoration='underline'
												fontSize='md'
												color='main'
											>
												{item.product.name}
											</LocaleNavLink>
										</Card.Title>
										{item.variantLabel && (
											<Text color='main.disabled' fontSize='sm' mt='-2'>
												{item.variantLabel}
											</Text>
										)}
										<Text
											color='main'
											fontSize='md'
											mb={{ base: 4, sm: 0 }}
											mr={{ base: 0, sm: 2 }}
										>
											{ordersT('unit')}: {item.unitPrice.toFixed(2)} ₴
										</Text>
									</Flex>
									<Text
										alignSelf={{ base: 'center', sm: 'flex-end' }}
										color='main'
										mr='4'
										textStyle='md'
										as='span'
										minW='56px'
									>
										{`x ${item.quantity}${commonT('units')}`}
									</Text>
								</Flex>

								{idx < order.items.length - 1 && <Separator my='4' color='border' />}
							</div>
						);
					})}
				</Stack>
			</Accordion.ItemBody>
		</Accordion.ItemContent>
	);
}
