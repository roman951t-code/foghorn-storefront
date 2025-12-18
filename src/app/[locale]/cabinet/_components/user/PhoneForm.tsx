import { Input, Field, Stack, Fieldset, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { useId, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PhoneSchemaData, type AccountSchemas } from 'formValidationSchemas/accountSchema';
import { updatePhoneNumberAction } from '@/actions/auth/updatePhoneNumberAction';
import { PHONE_INPUT_MASKS } from '@/constants/auth';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { FIELD_ORIENTATION_MD } from '@/constants/forms';
import { useMaskedInput } from '@/hooks/useMaskedInput';

interface Props {
	i18nData: I18nData;
	userPhone: string;
	refreshSession: () => void;
	schema: AccountSchemas['phoneSchema'];
}

export default function PhoneForm({ i18nData, userPhone, schema, refreshSession }: Props) {
	const [authError, setAuthError] = useState('');
	const [isPending, setIsPending] = useState(false);
	const phoneId = useId();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PhoneSchemaData>({
		mode: 'onSubmit',
		defaultValues: { phone: userPhone },
		resolver: zodResolver(schema),
	});

	const registerWithMask = useMaskedInput(register);

	const onSubmit = async (formData: PhoneSchemaData) => {
		setIsPending(true);
		setAuthError('');

		try {
			const result = await updatePhoneNumberAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message || i18nData.invalidFormData);
				return;
			}

			showToaster('success', toasterMessages.phoneUpdated(i18nData));
			await refreshSession();
		} catch {
			setAuthError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Content>
						<Field.Root
							orientation={FIELD_ORIENTATION_MD}
							justifyContent='center'
							invalid={!!errors.phone || !!authError}
						>
							<Field.Label maxH='20px' htmlFor={phoneId}>
								{i18nData.phone}
							</Field.Label>
							<Stack w='full' direction={{ base: 'column', sm: 'row' } as const} gap='4'>
								<VStack w='full' alignItems='flex-start'>
									<Input
										id={phoneId}
										{...registerWithMask('phone', PHONE_INPUT_MASKS, {
											required: i18nData.phoneRequired,
										})}
									type='text'
									variant='outline'
									size='md'
									maxLength={17}
								/>
								<Field.ErrorText>{errors.phone?.message || authError}</Field.ErrorText>
							</VStack>
							<SecondaryButton type='submit' loading={isPending} mt={{ base: '2', sm: '0' }}>
								{i18nData.save}
							</SecondaryButton>
						</Stack>
					</Field.Root>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
