'use client';

import { Icon, RadioCard, Stack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { SHIPMENT_OPTIONS } from '@/data/checkout/options';

export default function ShipmentStep() {
	const t = useTranslations('checkout');
	const shipmentMethod = useCheckoutStore((state) => state.shipmentMethod);
	const setShipmentMethod = useCheckoutStore((state) => state.setShipmentMethod);
	const items = SHIPMENT_OPTIONS.map((option) => ({
		...option,
		title: t(option.labelKey),
	}));

	return (
		<RadioCard.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			orientation={{ base: 'vertical', sm: 'horizontal' }}
			align='center'
			defaultValue='nova-poshta'
			mt='4'
			css={{
				'& div[data-state="unchecked"] span': {
					borderColor: 'var(--chakra-colors-fg) !important',
				},
			}}
			value={shipmentMethod}
			onChange={(event) => {
				const value = (event.target as HTMLInputElement).value;
				setShipmentMethod(value);
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
	);
}
