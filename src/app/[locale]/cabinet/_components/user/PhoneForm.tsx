import { Input, Field, Stack, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { useEffect, useId, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PhoneSchemaData, type AccountSchemas } from 'validationSchemas/accountSchema';
import { updatePhoneNumberAction } from '@/actions/auth/updatePhoneNumberAction';
import { PHONE_INPUT_MASKS } from '@/constants/auth';
import { useMaskedInput } from '@/hooks/useMaskedInput';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import PhoneUpdate from './PhoneUpdate';

interface Props {
	i18nData: I18nData;
	userPhone?: string;
	refreshSession: () => Promise<void>;
	schema: AccountSchemas['phoneSchema'];
}

export default function PhoneForm({ i18nData, userPhone, schema, refreshSession }: Props) {
	const [authError, setAuthError] = useState('');
	const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false);
	const [pendingPhone, setPendingPhone] = useState<string | null>(null);
	const phoneId = useId();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PhoneSchemaData>({
		mode: 'onSubmit',
		defaultValues: { phone: userPhone ?? '' },
		resolver: zodResolver(schema),
	});

	const registerWithMask = useMaskedInput(register);

	useEffect(() => {
		reset({ phone: userPhone ?? '' });
		setAuthError('');
	}, [reset, userPhone]);

	const onSubmit = async (formData: PhoneSchemaData) => {
		setAuthError('');

		try {
			const result = await updatePhoneNumberAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message || i18nData.invalidFormData);
				return;
			}

			setPendingPhone(formData.phone);
			setVerifyPhoneOpen(true);
		} catch {
			setAuthError(i18nData.invalidFormData);
		}
	};

	return (
		<VStack w='full' alignItems='stretch' gap='3'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root required invalid={!!errors.phone || !!authError}>
					<Field.Label maxH='20px' htmlFor={phoneId}>
						{i18nData.phone}
						<Field.RequiredIndicator />
					</Field.Label>
					<Stack w='full' direction={{ base: 'column', sm: 'row' } as const} gap='4'>
						<VStack w='full' alignItems='flex-start'>
							<Input
								id={phoneId}
								{...registerWithMask('phone', PHONE_INPUT_MASKS, {
									required: i18nData.phoneRequired,
								})}
								type='text'
								size='md'
								maxLength={17}
							/>
							<Field.ErrorText>{errors.phone?.message || authError}</Field.ErrorText>
						</VStack>
						<SecondaryButton
							type='submit'
							loading={isSubmitting}
							disabled={isSubmitting}
							w={{ base: 'full', sm: 'auto' }}
							mt={{ base: '2', sm: '0' }}
							alignSelf='flex-start'
						>
							{i18nData.save}
						</SecondaryButton>
					</Stack>
				</Field.Root>
			</form>

			<CenteredModal
				dialogId='cabinet-phone-verification-modal'
				closeOnInteractOutside={false}
				title={i18nData.phoneConfirmation}
				trigger={null}
				size='md'
				open={verifyPhoneOpen && !!pendingPhone}
				setIsOpen={(isOpen) => {
					setVerifyPhoneOpen(isOpen);
					if (!isOpen) {
						setPendingPhone(null);
					}
				}}
			>
				{pendingPhone ? (
					<PhoneUpdate
						phone={pendingPhone}
						i18nData={i18nData}
						refreshSessionAction={refreshSession}
						onCloseAction={() => {
							setVerifyPhoneOpen(false);
							setPendingPhone(null);
						}}
					/>
				) : (
					<></>
				)}
			</CenteredModal>
		</VStack>
	);
}
