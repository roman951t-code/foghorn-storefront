import { Icon, RadioCard, Stack } from '@chakra-ui/react';
import { FaTruck } from 'react-icons/fa';

const items = [
	{ value: 'paypal', title: 'Нова Пошта', icon: <FaTruck /> },
	{ value: 'apple-pay', title: 'УкрПошта', icon: <FaTruck /> },
	{ value: 'card', title: 'Meest', icon: <FaTruck /> },
];

export default function ShipmentStep() {
	return (
		<RadioCard.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			orientation={{ base: 'vertical', sm: 'horizontal', md: 'vertical', lg: 'horizontal' }}
			align='center'
			defaultValue='paypal'
			mt='4'
			css={{
				'& div[data-state="unchecked"] span': {
					color: 'var(--chakra-colors-fg) !important',
				},
			}}
		>
			<Stack direction={{ base: 'column', xs: 'row' }} gap='4'>
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
	);
}
