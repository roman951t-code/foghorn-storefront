'use client';

import { Box, Icon, RadioCard, Stack, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { PAYMENT_OPTIONS } from '@/data/checkout/options';

export default function PaymentStep() {
	const t = useTranslations('checkout');
	const selectedPayment = useCheckoutStore((state) => state.paymentMethod);
	const setSelectedPayment = useCheckoutStore((state) => state.setPaymentMethod);
	const items = PAYMENT_OPTIONS.map((option) => ({
		...option,
		title: t(option.labelKey),
	}));
	const orientation =
		useBreakpointValue<'vertical' | 'horizontal'>({ base: 'vertical', sm: 'horizontal' }) ??
		'vertical';
	const isCardSelected = selectedPayment === 'card';
	const isStripeTestMode =
		typeof process !== 'undefined' &&
		Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'));

	return (
		<VStack align='stretch' gap='6'>
			<RadioCard.Root
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
				orientation={orientation}
				align='center'
				defaultValue='paypal'
				mt='4'
				css={{
					'& div[data-state="unchecked"] span': {
						borderColor: 'var(--chakra-colors-fg) !important',
					},
				}}
				value={selectedPayment}
				onChange={(event) => {
					const value = (event.target as HTMLInputElement).value;
					setSelectedPayment(value);
				}}
			>
				<Stack direction={{ base: 'column', sm: 'row' }} gap='4'>
					{items.map((item) => (
						<RadioCard.Item
							key={item.value}
							value={item.value}
							boxShadow='none'
							_hover={{ cursor: 'pointer' }}
							bg='main'
							justifyContent={{ base: 'initial', xl: 'center' }}
							h={{ base: 'auto', xl: '48px' }}
						>
							<RadioCard.ItemHiddenInput />
							<RadioCard.ItemControl>
								<Icon as={item.icon} fontSize='2xl' color='fg.muted' />
								<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
								<RadioCard.ItemIndicator />
							</RadioCard.ItemControl>
						</RadioCard.Item>
					))}
				</Stack>
			</RadioCard.Root>

			{isCardSelected ? (
				<Box
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='md'
					p={{ base: 4, md: 5 }}
				>
					<VStack align='stretch' gap='3'>
						<Text fontWeight='semibold'>{t('payment.cardForm.title')}</Text>
						<Text fontSize='sm' color='fg.muted'>
							{t('payment.cardForm.description')}
						</Text>
						{isStripeTestMode ? (
							<Box
								borderWidth='0.5px'
								borderStyle='solid'
								borderColor='border'
								borderRadius='md'
								p='3'
							>
								<Text fontSize='sm' fontWeight='semibold'>
									{t('payment.cardForm.testModeTitle')}
								</Text>
								<Text fontSize='sm' mt='1'>
									{t('payment.cardForm.testCard')}: 4242 4242 4242 4242
								</Text>
								<Text fontSize='sm'>
									{t('payment.cardForm.testExpiry')}: 12/34
								</Text>
								<Text fontSize='sm'>
									{t('payment.cardForm.testCvc')}: 123
								</Text>
								<Text fontSize='sm' mt='1'>
									{t('payment.cardForm.testDeclineCard')}: 4000 0000 0000 0002
								</Text>
							</Box>
						) : null}
					</VStack>
				</Box>
			) : null}
		</VStack>
	);
}
