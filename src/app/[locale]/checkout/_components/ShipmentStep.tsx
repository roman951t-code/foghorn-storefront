'use client';

import { Icon, RadioCard, Stack } from '@chakra-ui/react';
import { FaTruck } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function ShipmentStep() {
	const t = useTranslations('checkout');
	const items = [
		{ value: 'nova-poshta', title: t('shipment.novaPoshta'), icon: <FaTruck /> },
		{ value: 'ukrposhta', title: t('shipment.ukrposhta'), icon: <FaTruck /> },
		{ value: 'meest', title: t('shipment.meest'), icon: <FaTruck /> },
	];

	return (
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
