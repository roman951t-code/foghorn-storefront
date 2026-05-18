'use client';

import { Icon, RadioCard, Stack, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { SHIPMENT_OPTIONS } from '@/data/checkout/options';
import { useSession } from '@/providers/SessionProvider';
import { useEffect, useRef } from 'react';
import { getCountryFromLocale } from '@/utils/countries';
import { toShippingAddressFormValue } from '@/utils/shippingAddress';

export default function ShipmentStep() {
	const { session } = useSession();
	const locale = useLocale();
	const t = useTranslations('checkout');
	const shipmentMethod = useCheckoutStore((state) => state.shipmentMethod);
	const setShipmentMethod = useCheckoutStore((state) => state.setShipmentMethod);
	const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
	const setShippingAddress = useCheckoutStore((state) => state.setShippingAddress);
	const setShippingAddressField = useCheckoutStore((state) => state.setShippingAddressField);
	const userId = session?.user?.id ?? null;
	const userShippingCountry = session?.user?.shippingCountry ?? null;
	const userShippingRegion = session?.user?.shippingRegion ?? null;
	const userShippingCity = session?.user?.shippingCity ?? null;
	const userShippingPostalCode = session?.user?.shippingPostalCode ?? null;
	const userShippingAddressLine1 = session?.user?.shippingAddressLine1 ?? null;
	const userShippingAddressLine2 = session?.user?.shippingAddressLine2 ?? null;
	const prefilledKeyRef = useRef<string>('');

	useEffect(() => {
		const prefillKey = userId
			? [
					`user:${userId}`,
					userShippingCountry,
					userShippingRegion,
					userShippingCity,
					userShippingPostalCode,
					userShippingAddressLine1,
					userShippingAddressLine2,
				].join('|')
			: `guest:${locale}`;
		if (prefilledKeyRef.current === prefillKey) return;

		const savedAddress = toShippingAddressFormValue({
			country: userShippingCountry,
			region: userShippingRegion,
			city: userShippingCity,
			postalCode: userShippingPostalCode,
			addressLine1: userShippingAddressLine1,
			addressLine2: userShippingAddressLine2,
		});

		if (Object.values(savedAddress).some((value) => value.length > 0)) {
			setShippingAddress(savedAddress);
			prefilledKeyRef.current = prefillKey;
			return;
		}

		const defaultCountry = getCountryFromLocale(locale);
		if (defaultCountry && !shippingAddress.country.trim()) {
			setShippingAddressField('country', defaultCountry);
		}
		prefilledKeyRef.current = prefillKey;
	}, [
		locale,
		setShippingAddress,
		setShippingAddressField,
		shippingAddress.country,
		userId,
		userShippingAddressLine1,
		userShippingAddressLine2,
		userShippingCity,
		userShippingCountry,
		userShippingPostalCode,
		userShippingRegion,
	]);

	const items = SHIPMENT_OPTIONS.map((option) => ({
		...option,
		title: t(option.labelKey),
	}));
	const orientation =
		useBreakpointValue<'vertical' | 'horizontal'>({ base: 'vertical', sm: 'horizontal' }) ??
		'vertical';

	return (
		<VStack align='stretch' gap='6'>
			<RadioCard.Root
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
				orientation={orientation}
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
		</VStack>
	);
}
