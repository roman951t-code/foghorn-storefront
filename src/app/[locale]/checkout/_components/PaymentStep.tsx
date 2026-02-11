'use client';

import { ChangeEvent, useState } from 'react';
import { Field, Icon, Input, RadioCard, SimpleGrid, Stack, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { PAYMENT_OPTIONS } from '@/data/checkout/options';

const getDigits = (value: string) => value.replace(/\D/g, '');

const formatCardNumber = (value: string) => {
	const digits = getDigits(value).slice(0, 16);
	const groups = digits.match(/.{1,4}/g);
	return groups ? groups.join(' ') : '';
};

const formatCardExpiry = (value: string) => {
	const digits = getDigits(value).slice(0, 4);
	if (digits.length <= 1) return digits;

	let month = digits.slice(0, 2);
	const monthNumber = Number(month);

	if (!Number.isNaN(monthNumber)) {
		if (monthNumber < 1) month = '01';
		if (monthNumber > 12) month = '12';
	}

	const year = digits.slice(2);
	return year ? `${month}/${year}` : month;
};

export default function PaymentStep() {
	const t = useTranslations('checkout');
	const selectedPayment = useCheckoutStore((state) => state.paymentMethod);
	const setSelectedPayment = useCheckoutStore((state) => state.setPaymentMethod);
	const [cardNumber, setCardNumber] = useState('');
	const [cardExpiry, setCardExpiry] = useState('');
	const [cardCvv, setCardCvv] = useState('');
	const items = PAYMENT_OPTIONS.map((option) => ({
		...option,
		title: t(option.labelKey),
	}));
	const orientation =
		useBreakpointValue<'vertical' | 'horizontal'>({ base: 'vertical', sm: 'horizontal' }) ??
		'vertical';
	const isCardSelected = selectedPayment === 'card';

	const onCardNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCardNumber(formatCardNumber(event.target.value));
	};

	const onCardExpiryChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCardExpiry(formatCardExpiry(event.target.value));
	};

	const onCardCvvChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCardCvv(getDigits(event.target.value).slice(0, 3));
	};

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
				<VStack
					align='stretch'
					gap='4'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='md'
					p={{ base: 4, md: 5 }}
				>
					<VStack align='stretch' gap='1'>
						<Text fontWeight='semibold'>{t('payment.cardForm.title')}</Text>
						<Text fontSize='sm' color='fg.muted'>
							{t('payment.cardForm.description')}
						</Text>
					</VStack>

					<Field.Root required>
						<Field.Label>
							{t('payment.cardForm.cardholder')}
							<Field.RequiredIndicator />
						</Field.Label>
						<Input
							name='cardholder'
							autoComplete='cc-name'
							maxLength={60}
							placeholder={t('payment.cardForm.cardholderPlaceholder')}
						/>
					</Field.Root>

					<Field.Root required>
						<Field.Label>
							{t('payment.cardForm.number')}
							<Field.RequiredIndicator />
						</Field.Label>
						<Input
							name='cardNumber'
							autoComplete='cc-number'
							inputMode='numeric'
							maxLength={19}
							placeholder={t('payment.cardForm.numberPlaceholder')}
							value={cardNumber}
							onChange={onCardNumberChange}
						/>
					</Field.Root>

					<SimpleGrid columns={{ base: 1, sm: 2 }} gap='4'>
						<Field.Root required>
							<Field.Label>
								{t('payment.cardForm.expiry')}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input
								name='cardExpiry'
								autoComplete='cc-exp'
								inputMode='numeric'
								maxLength={5}
								placeholder={t('payment.cardForm.expiryPlaceholder')}
								value={cardExpiry}
								onChange={onCardExpiryChange}
							/>
						</Field.Root>

						<Field.Root required>
							<Field.Label>
								{t('payment.cardForm.cvv')}
								<Field.RequiredIndicator />
							</Field.Label>
						<Input
							name='cardCvv'
							type='password'
							autoComplete='cc-csc'
							inputMode='numeric'
							maxLength={3}
							placeholder={t('payment.cardForm.cvvPlaceholder')}
							value={cardCvv}
							onChange={onCardCvvChange}
						/>
						</Field.Root>
					</SimpleGrid>
				</VStack>
			) : null}
		</VStack>
	);
}
