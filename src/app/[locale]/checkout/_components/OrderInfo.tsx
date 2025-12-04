'use client';

import {
	Heading,
	Text,
	VStack,
	Flex,
	Stack,
	Highlight,
	Separator,
	Stat,
	Box,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { SidebarCheckoutCard, FullCheckoutCard } from '@/features/checkout/CheckoutCard';
import AcceptOrderBtn from './AcceptOrderBtn';
import { useCart } from '@/hooks/useCart';
import { calculateCartTotals } from '@/utils/cartTotals';

export default function OrderInfo() {
	const t = useTranslations('products');
	const commonT = useTranslations('common');
	const { cartData } = useCart();
	const cartItems = cartData.items;
	const { totalCount, baseTotal, discountedTotal, discountTotal } = calculateCartTotals(cartItems);
	const unitsLabel = commonT('units');
	const productsLabel = `${t('productsInCart')}: ${totalCount} ${unitsLabel}`;
	const orderSumText = `${baseTotal.toFixed(2)} ₴`;
	const discountText = `${
		discountTotal > 0 ? `-${discountTotal.toFixed(2)}` : discountTotal.toFixed(2)
	} ₴`;
	const totalAmountText = `${discountedTotal.toFixed(2)} ₴`;

	return (
		<Flex direction='column' w='100%' gap={2}>
			<Heading as='h3' mt='4' size='2xl' fontWeight='medium' textAlign='center'>
				{t('yourOrder')}
			</Heading>
			<Separator my='2' color='border.dark' />
			<Box maxH='600px' overflowY='auto' hideBelow='lg'>
				{cartItems.map((item) => (
					<SidebarCheckoutCard key={item.id} product={item} />
				))}
			</Box>
			<Box maxH='600px' overflowY='auto' hideFrom='lg'>
				{cartItems.map((item) => (
					<FullCheckoutCard key={item.id} product={item} />
				))}
			</Box>

			<VStack alignItems='flex-start' hideBelow='lg' gapY='3' p='4'>
				<Text>
					<Highlight query={`${totalCount} ${unitsLabel}`} styles={{ fontWeight: 'semibold' }}>
						{productsLabel}
					</Highlight>
				</Text>
				<Text>
					<Highlight query={orderSumText} styles={{ fontWeight: 'semibold' }}>
						{`${t('orderSum')}: ${orderSumText}`}
					</Highlight>
				</Text>

				<Text>
					<Highlight
						query={discountText}
						styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
					>
						{`${t('discountSum')}: ${discountText}`}
					</Highlight>
				</Text>
				<Separator w='full' mt='2' color='border.dark' />
				<Stat.Root mt='2'>
					<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
					<Stat.ValueText fontSize='3xl'>{`${discountedTotal.toFixed(2)} ₴`}</Stat.ValueText>
				</Stat.Root>
				<AcceptOrderBtn text={t('acceptOrder')} w='100%' mt='4' maxW='280px' />
			</VStack>

			<Stack
				hideFrom='lg'
				justifyContent='space-between'
				alignItems='flex-start'
				mt='4'
				direction={{ base: 'column', sm: 'row' }}
			>
				<VStack alignItems='flex-start' order={{ base: 2, sm: 1 }} gap='6'>
					<Stat.Root mt={{ base: 2, sm: 0 }}>
						<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
						<Stat.ValueText fontSize='3xl'>{totalAmountText}</Stat.ValueText>
					</Stat.Root>
					<AcceptOrderBtn text={t('acceptOrder')} m={{ base: 'initial', md: 'auto' }} />
				</VStack>
				<VStack
					alignItems={{ base: 'flex-start', sm: 'flex-end' }}
					order={{ base: 1, sm: 2 }}
					gap='3'
				>
					<Text>
						<Highlight query={`${totalCount} ${unitsLabel}`} styles={{ fontWeight: 'semibold' }}>
							{productsLabel}
						</Highlight>
					</Text>
					<Text>
						<Highlight query={orderSumText} styles={{ fontWeight: 'semibold' }}>
							{`${t('orderSum')}: ${orderSumText}`}
						</Highlight>
					</Text>

					<Text>
						<Highlight
							query={discountText}
							styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
						>
							{`${t('discountSum')}: ${discountText}`}
						</Highlight>
					</Text>
				</VStack>
			</Stack>
		</Flex>
	);
}
