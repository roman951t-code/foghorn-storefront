import { Input, Field, VStack, Stack } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';

interface Props {
	phoneForm: UseFormReturn<
		{
			phone: string;
		},
		unknown,
		{
			phone: string;
		}
	>;
	error?: { message?: string };
	pending: boolean;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function PhoneForm({ phoneForm, i18nData, error, pending, onSubmitAction }: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Field.Root
				orientation={fieldOrientation}
				invalid={!!phoneForm.formState.errors.phone || !!error?.message}
				justifyContent='center'
			>
				<Field.Label maxH='20px'>{i18nData.phone}</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as any} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input {...phoneForm.register('phone')} variant='outline' size='md' />
						<Field.ErrorText>
							{phoneForm.formState.errors.phone?.message?.toString() || error?.message}
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
