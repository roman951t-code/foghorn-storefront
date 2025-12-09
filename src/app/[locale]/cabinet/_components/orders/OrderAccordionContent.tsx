'use client';

import { Accordion, Card, Flex, Separator, Stack, Stat, Text } from '@chakra-ui/react';
import { BsArrowRepeat } from 'react-icons/bs';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { buildProductImages, toPreviewImage } from '@/utils/productImages';
import { repeatOrderAction } from '@/actions/repeatOrderAction';
import { useCartStore } from '@/stores/cartStore';
import { showToaster } from '@/utils/toast';
import Image from 'next/image';
import type { UserOrder } from '@/types/order';

type Props = {
	order: UserOrder;
};

export function OrderAccordionContent({ order }: Props) {
	const productsT = useTranslations('products');
	const ordersT = useTranslations('orders');
	const commonT = useTranslations('common');
	const setCartItems = useCartStore((state) => state.setCartItems);
	const [isRepeating, startTransition] = useTransition();

	const handleRepeatOrder = () => {
		startTransition(async () => {
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

	return (
		<Accordion.ItemContent>
			<Accordion.ItemBody p='0' pt='4'>
				<Flex justifyContent={{ base: 'center', xs: 'flex-end' } as any} mb='4'>
					<PrimaryButton onClick={handleRepeatOrder} loading={isRepeating}>
						<BsArrowRepeat />
						{productsT('repeatOrder')}
					</PrimaryButton>
				</Flex>
				<Separator mt='4' mb='6' color='border.dark' />
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
											style={{ objectFit: 'contain', borderRadius: '6px' }}
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
										<Text
											color='main'
											fontSize='md'
											mb={{ base: 4, sm: 0 }}
											mr={{ base: 0, sm: 2 }}
										>
											{ordersT('unit')}: {item.unitPrice.toFixed(2)} ₴
										</Text>
									</Flex>
									<Stat.Root alignSelf={{ base: 'center', sm: 'flex-end' }} color='main' mr='4'>
										<Stat.ValueText textStyle='md' minW='42px'>
											{`x ${item.quantity}${commonT('units')}`}
										</Stat.ValueText>
									</Stat.Root>
								</Flex>

								{idx < order.items.length - 1 && <Separator my='4' color='border.dark' />}
							</div>
						);
					})}
				</Stack>
			</Accordion.ItemBody>
		</Accordion.ItemContent>
	);
}
