'use client';

import { useTransition } from 'react';
import { Accordion, Card, Flex, HStack, Icon, Separator, Stack, Tag, Text, Box } from '@chakra-ui/react';
import { BsArrowRepeat } from 'react-icons/bs';
import { FiTruck } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import {
	resolveProductPrimaryImage,
	toPreviewImage,
} from '@/utils/productImages';
import { repeatOrderAction } from '@/actions/repeatOrderAction';
import { useCartStore } from '@/stores/cartStore';
import { showToaster } from '@/utils/toast';
import Image from 'next/image';
import type { UserOrder } from '@/types/order';
import { useRouter } from 'next/navigation';
import { deleteOrderAction } from '@/actions/deleteOrderAction';
import { isCustomerOrderCancellable, isCustomerOrderDeletable } from '@/utils/orderStatusPolicy';
import { formatUsdPrice } from '@/utils/priceFormatting';

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
	const canCancelOrder = isCustomerOrderCancellable(order.status);
	const canDeleteOrder = isCustomerOrderDeletable(order.status);
	const canMutateOrder = canCancelOrder || canDeleteOrder;
	const deleteLabel = canCancelOrder ? ordersT('cancelOrder') : ordersT('deleteOrder');
	const hasFulfillmentDetails = Boolean(order.carrier || order.trackingNumber);

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
			try {
				const result = await deleteOrderAction(order.id);

				if (result.success) {
					showToaster(
						'success',
						ordersT(result.action === 'cancelled' ? 'orderCancelSuccess' : 'orderDeleteSuccess')
					);
					router.refresh();
				} else {
					const key =
						result.code === 'unauthorized' ? 'orderDeleteUnauthorized' : 'orderDeleteFailed';
					showToaster('error', ordersT(key));
				}
			} catch {
				showToaster('error', ordersT('orderDeleteFailed'));
			}
		});
	};

	return (
		<Accordion.ItemContent>
			<Accordion.ItemBody p='0' pt='4' mt='2'>
				<Flex
					justifyContent={canMutateOrder ? 'space-between' : 'flex-end'}
					alignItems='center'
					gap='3'
					flexWrap='wrap'
					mb='4'
				>
					{canMutateOrder ? (
						<SecondaryButton onClick={handleDeleteOrder} loading={isDeleting} disabled={isDeleting}>
							{deleteLabel}
						</SecondaryButton>
					) : null}
					<PrimaryButton onClick={handleRepeatOrder} loading={isRepeating}>
							<BsArrowRepeat />
							{productsT('repeatOrder')}
					</PrimaryButton>
				</Flex>

				{hasFulfillmentDetails ? (
					<Card.Root
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						overflow='hidden'
						p='4'
						bg='bg.tertiary'
					>
						<Flex justifyContent='space-between' alignItems='center' gap='3' flexWrap='wrap'>
							<HStack gap='2'>
								<Icon as={FiTruck} size='md' color='fg.muted' />
								<Text fontWeight='semibold' color='main'>
									{ordersT('tracking')}
								</Text>
							</HStack>

							<HStack gap='2' flexWrap='wrap'>
								{order.carrier ? (
									<Tag.Root
										variant='surface'
										borderWidth='0.5px'
										boxShadow='none'
										bg='bg.tertiary'
										borderColor='border'
										size='lg'
										color='main'
										py='1.5'
									>
										<Tag.Label fontSize={{ base: 'md', md: 'sm' }}>
											<Text as='span' color='fg.muted'>
												{ordersT('carrier')}:
											</Text>{' '}
											<Text as='span' fontWeight='semibold'>
												{order.carrier}
											</Text>
										</Tag.Label>
									</Tag.Root>
								) : null}

								{order.trackingNumber ? (
									<Tag.Root
										variant='surface'
										borderWidth='0.5px'
										boxShadow='none'
										bg='bg.tertiary'
										borderColor='border'
										size='lg'
										color='main'
										py='1.5'
									>
										<Tag.Label fontSize={{ base: 'md', md: 'sm' }}>
											<Text as='span' color='fg.muted'>
												{ordersT('trackingNumber')}:
											</Text>{' '}
											<Text as='span' fontWeight='semibold' fontFamily='mono'>
												{order.trackingNumber}
											</Text>
										</Tag.Label>
									</Tag.Root>
								) : null}
							</HStack>
						</Flex>
					</Card.Root>
				) : null}

				<Separator mt='4' mb='6' color='border' />
				<Stack maxH='510px' overflowY='auto'>
					{order.items.map((item, idx) => {
						const previewImage = toPreviewImage(
							resolveProductPrimaryImage(item.product.imageUrl)
						);

						return (
							<div key={item.id}>
								<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} gap='3'>
									<LocaleNavLink href={`/products/${item.product.fullSlug}`} mr='2'>
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
												src={previewImage}
												alt={item.product.name}
												style={{
													objectFit: 'contain',
													paddingTop: '4px',
												}}
											/>
										</Box>
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
											<Text color='main.disabled' fontSize={{ base: 'md', md: 'sm' }} mt='-2'>
												{item.variantLabel}
											</Text>
										)}
										<Text
											color='main'
											fontSize='md'
											mb={{ base: 4, sm: 0 }}
											mr={{ base: 0, sm: 2 }}
										>
											{ordersT('unit')}: {formatUsdPrice(item.unitPrice)}
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
