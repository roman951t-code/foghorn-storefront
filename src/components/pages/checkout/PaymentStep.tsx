import { Icon, RadioCard, Stack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { RiAppleFill, RiBankCardFill, RiPaypalFill } from 'react-icons/ri';

const items = [
	{ value: 'paypal', title: 'Paypal', icon: <RiPaypalFill /> },
	{ value: 'apple-pay', title: 'Apple Pay', icon: <RiAppleFill /> },
	{ value: 'card', title: 'Card', icon: <RiBankCardFill /> },
];

export default function PaymentStep() {
	const t = useTranslations('Products');

	return (
		<RadioCard.Root
			orientation={{ base: 'vertical', xl: 'horizontal' }}
			align='center'
			defaultValue='paypal'
			mt='4'
		>
			<Stack direction={{ base: 'column', xs: 'row' }}>
				{items.map((item) => (
					<RadioCard.Item key={item.value} value={item.value} _hover={{ cursor: 'pointer' }}>
						<RadioCard.ItemHiddenInput />
						<RadioCard.ItemControl>
							<Icon fontSize='2xl' color='fg.muted'>
								{item.icon}
							</Icon>
							<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
						</RadioCard.ItemControl>
					</RadioCard.Item>
				))}
			</Stack>
		</RadioCard.Root>
	);
}
