'use client';

import { useTransition } from 'react';
import { Accordion, Card, Flex, HStack, Icon, Separator, Stack, Tag, Text } from '@chakra-ui/react';
import { BsArrowRepeat } from 'react-icons/bs';
import { FiTruck } from 'react-icons/fi';
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
										<Tag.Label fontSize='sm'>
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
										<Tag.Label fontSize='sm'>
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
