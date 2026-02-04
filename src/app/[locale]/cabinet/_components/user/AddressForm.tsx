import { Input, Field, VStack, Stack } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { FIELD_ORIENTATION_MD } from '@/constants/forms';

interface Props {
	addressForm: UseFormReturn<
		{
			shipmentAddress: string;
		},
		unknown,
		{
			shipmentAddress: string;
		}
	>;
	error?: { message?: string };
	pending: boolean;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function AddressForm({
	i18nData,
	error,
	pending,
	addressForm,
	onSubmitAction,
}: Props) {
	return (
		<form onSubmit={onSubmitAction}>
			<Field.Root
				orientation={FIELD_ORIENTATION_MD}
				invalid={!!addressForm.formState.errors.shipmentAddress}
				justifyContent='center'
				required
			>
				<Field.Label maxH='20px'>
					{i18nData.shipmentAddress}
					<Field.RequiredIndicator />
				</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as const} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input {...addressForm.register('shipmentAddress')} size='md' />
						<Field.ErrorText>
							{addressForm.formState.errors.shipmentAddress?.message?.toString() || error?.message}
						</Field.ErrorText>
					</VStack>

					<SecondaryButton type='submit' loading={pending} mt={{ base: '2', sm: '0' }}>
						{i18nData.save}
					</SecondaryButton>
				</Stack>
			</Field.Root>
		</form>
	);
}
