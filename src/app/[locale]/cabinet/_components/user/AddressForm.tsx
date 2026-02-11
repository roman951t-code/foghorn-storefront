'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Field, Fieldset, Input, VStack } from '@chakra-ui/react';
import { useEffect, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { z } from 'zod';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { editShippingAddressAction } from '@/actions/auth/editAccountAction';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { getCountryOptions } from '@/utils/countries';
import { SHIPPING_ADDRESS_FIELD_LIMITS, type ShippingAddressFormValue } from '@/utils/shippingAddress';
import CountryField from './CountryField';

interface Props {
	i18nData: I18nData;
	initialAddress: ShippingAddressFormValue;
	refreshSession: () => Promise<void>;
}

export default function AddressForm({ i18nData, initialAddress, refreshSession }: Props) {
	const checkoutT = useTranslations('checkout');
	const locale = useLocale();
	const countryInputId = useId();

	const requiredMessage = i18nData.fieldRequired || i18nData.invalidFormData;
	const schema = useMemo(
		() =>
			z.object({
				country: z
					.string()
					.trim()
					.min(1, { message: requiredMessage })
					.max(SHIPPING_ADDRESS_FIELD_LIMITS.country),
				region: z
					.string()
					.trim()
					.min(1, { message: requiredMessage })
					.max(SHIPPING_ADDRESS_FIELD_LIMITS.region),
				city: z
					.string()
					.trim()
					.min(1, { message: requiredMessage })
					.max(SHIPPING_ADDRESS_FIELD_LIMITS.city),
				postalCode: z
					.string()
					.trim()
					.min(1, { message: requiredMessage })
					.max(SHIPPING_ADDRESS_FIELD_LIMITS.postalCode),
				addressLine1: z
					.string()
					.trim()
					.min(1, { message: requiredMessage })
					.max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1),
				addressLine2: z.string().trim().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine2),
			}),
		[requiredMessage]
	);

	const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
	const countryItems = useMemo(
		() => countryOptions.map((country) => ({ label: country, value: country })),
		[countryOptions]
	);

	const addressForm = useForm<ShippingAddressFormValue>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
		defaultValues: initialAddress,
	});
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = addressForm;

	useEffect(() => {
		reset(initialAddress);
	}, [initialAddress, reset]);

	const onSubmit = async (formData: ShippingAddressFormValue) => {
		const result = await editShippingAddressAction(null, formData);

		if (!result?.success) {
			showToaster('error', toasterMessages.addressUpdateFailed(result?.message, i18nData));
			return;
		}

		showToaster('success', toasterMessages.addressUpdated(i18nData));
		await refreshSession();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Fieldset.Root size='lg' alignItems='stretch' w='full'>
				<Fieldset.Content
					css={{ '--field-label-width': '180px' }}
					bg='bg.tertiary'
					gap='6'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p={{ base: 4, md: 6 }}
					w='full'
				>
					<Box
						display='grid'
						gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
						gap='3'
					>
						<CountryField
							control={control}
							countryItems={countryItems}
							countryInputId={countryInputId}
							label={checkoutT('shippingCountry')}
							placeholder={checkoutT('shippingCountryPlaceholder')}
							error={errors.country}
						/>

						<Field.Root required invalid={!!errors.region}>
							<Field.Label>
								{checkoutT('shippingRegion')}
								<Field.RequiredIndicator />
							</Field.Label>
							<VStack alignItems='flex-start' w='full'>
								<Input
									{...register('region')}
									placeholder={checkoutT('shippingRegionPlaceholder')}
								/>
								<Field.ErrorText>
									{errors.region?.message?.toString()}
								</Field.ErrorText>
							</VStack>
						</Field.Root>

						<Field.Root required invalid={!!errors.city}>
							<Field.Label>
								{checkoutT('shippingCity')}
								<Field.RequiredIndicator />
							</Field.Label>
							<VStack alignItems='flex-start' w='full'>
								<Input
									{...register('city')}
									placeholder={checkoutT('shippingCityPlaceholder')}
								/>
								<Field.ErrorText>
									{errors.city?.message?.toString()}
								</Field.ErrorText>
							</VStack>
						</Field.Root>

						<Field.Root required invalid={!!errors.postalCode}>
							<Field.Label>
								{checkoutT('shippingPostalCode')}
								<Field.RequiredIndicator />
							</Field.Label>
							<VStack alignItems='flex-start' w='full'>
								<Input
									{...register('postalCode')}
									placeholder={checkoutT('shippingPostalCodePlaceholder')}
								/>
								<Field.ErrorText>
									{errors.postalCode?.message?.toString()}
								</Field.ErrorText>
							</VStack>
						</Field.Root>
					</Box>

					<Field.Root required invalid={!!errors.addressLine1}>
						<Field.Label>
							{checkoutT('shippingAddressLine1')}
							<Field.RequiredIndicator />
						</Field.Label>
						<VStack alignItems='flex-start' w='full'>
							<Input
								{...register('addressLine1')}
								placeholder={checkoutT('shippingAddressLine1Placeholder')}
							/>
							<Field.ErrorText>
								{errors.addressLine1?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root invalid={!!errors.addressLine2}>
						<Field.Label>{checkoutT('shippingAddressLine2')}</Field.Label>
						<VStack alignItems='flex-start' w='full'>
							<Input
								{...register('addressLine2')}
								placeholder={checkoutT('shippingAddressLine2Placeholder')}
							/>
							<Field.ErrorText>
								{errors.addressLine2?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<SecondaryButton
						alignSelf={{ base: 'stretch', sm: 'flex-end' }}
						type='submit'
						size='md'
						loading={isSubmitting}
					>
						{i18nData.save}
					</SecondaryButton>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
