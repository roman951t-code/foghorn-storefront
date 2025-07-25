'use client';

import { Box, Group, Input, Icon, RadioCard, Stack, InputGroup, Show } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCreditCard } from 'react-icons/lu';
import { usePaymentInputs } from 'react-payment-inputs';
import cardImages, { type CardImages } from 'react-payment-inputs/images';
import { RiAppleFill, RiBankCardFill, RiPaypalFill } from 'react-icons/ri';

const items = [
	{ value: 'paypal', title: 'Paypal', icon: <RiPaypalFill /> },
	{ value: 'apple-pay', title: 'Apple Pay', icon: <RiAppleFill /> },
	{ value: 'card', title: 'Card', icon: <RiBankCardFill /> },
];

const images = cardImages as unknown as CardImages;

const CardImage = (props: ReturnType<typeof usePaymentInputs>) => {
	const { meta, getCardImageProps } = props;
	return (
		<Show when={meta.cardType} fallback={<LuCreditCard size={16} aria-hidden='true' />}>
			<svg {...getCardImageProps({ images })} />
		</Show>
	);
};

export default function PaymentStep() {
	const payment = usePaymentInputs();
	const [selectedPayment, setSelectedPayment] = useState('paypal');

	return (
		<>
			<RadioCard.Root
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
				orientation={{ base: 'vertical', sm: 'horizontal' }}
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
				<Stack direction={{ base: 'column', xs: 'row' } as any}>
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
								<Icon fontSize='2xl' color='fg.muted'>
									{item.icon}
								</Icon>
								<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
								<RadioCard.ItemIndicator />
							</RadioCard.ItemControl>
						</RadioCard.Item>
					))}
				</Stack>
			</RadioCard.Root>

			{selectedPayment === 'card' && (
				<Box mt='8' spaceY='-1px'>
					<InputGroup zIndex={{ _focusWithin: '1' }} endElement={<CardImage {...payment} />}>
						<Input roundedBottom='0' {...payment.getCardNumberProps()} />
					</InputGroup>
					<Group w='full' attached>
						<Input roundedTopLeft='0' {...payment.getExpiryDateProps()} />
						<Input roundedTopRight='0' {...payment.getCVCProps()} />
					</Group>
				</Box>
			)}
		</>
	);
}
