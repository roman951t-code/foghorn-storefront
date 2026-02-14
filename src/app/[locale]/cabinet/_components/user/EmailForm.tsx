import { Field, Input, Stack, VStack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { createEmailSubscribeSchema, type EmailSchema } from 'validationSchemas/emailSubscribeSchema';
import { sendVerifyEmailAction } from '@/actions/auth/sendVerifyEmailAction';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import EmailVerification from './EmailVerification';

interface Props {
	userEmail?: string;
	i18nData: I18nData;
}

export default function EmailForm({ i18nData, userEmail }: Props) {
	const emailId = useId();
	const normalizedUserEmail = userEmail?.trim() ?? '';
	const isEmailMissing = normalizedUserEmail.length === 0;
	const emailSchema = useMemo(() => createEmailSubscribeSchema(i18nData), [i18nData]);

	const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
	const [verifyError, setVerifyError] = useState('');
	const [pendingEmail, setPendingEmail] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EmailSchema>({
		mode: 'onSubmit',
		defaultValues: { email: normalizedUserEmail },
		resolver: zodResolver(emailSchema),
	});

	useEffect(() => {
		reset({ email: normalizedUserEmail });
		setVerifyError('');
	}, [normalizedUserEmail, reset]);

	const onSubmit = async (formData: EmailSchema) => {
		if (!isEmailMissing) return;

		setVerifyError('');
		try {
			const result = await sendVerifyEmailAction(null, formData);
			if (!result?.success) {
				setVerifyError(result?.message || i18nData.editEmailFail || i18nData.invalidFormData);
				return;
			}

			setPendingEmail(formData.email.trim());
			setVerifyEmailOpen(true);
		} catch {
			setVerifyError(i18nData.editEmailFail || i18nData.invalidFormData);
		}
	};

	return (
		<VStack w='full' alignItems='stretch' gap='3'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root required={isEmailMissing} invalid={!!errors.email || !!verifyError}>
					<Field.Label maxH='20px' htmlFor={emailId}>
						{i18nData.email}
						{isEmailMissing && <Field.RequiredIndicator />}
					</Field.Label>
					<Stack w='full' direction={{ base: 'column', sm: 'row' } as const} gap='4'>
						<Input
							id={emailId}
							{...register('email')}
							type='email'
							size='md'
							readOnly={!isEmailMissing}
						/>
						{isEmailMissing && (
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
						)}
					</Stack>
					<Field.ErrorText>{errors.email?.message || verifyError}</Field.ErrorText>
				</Field.Root>
			</form>

			<CenteredModal
				dialogId='cabinet-email-verification-modal'
				closeOnInteractOutside={false}
				title={i18nData.emailConfirmation}
				trigger={null}
				size='md'
				open={verifyEmailOpen && !!pendingEmail}
				setIsOpen={(isOpen) => {
					setVerifyEmailOpen(isOpen);
					if (!isOpen) {
						setPendingEmail(null);
					}
				}}
			>
				{pendingEmail ? (
					<EmailVerification
						email={pendingEmail}
						i18nData={i18nData}
						onCloseAction={() => {
							setVerifyEmailOpen(false);
							setPendingEmail(null);
						}}
					/>
				) : (
					<></>
				)}
			</CenteredModal>
		</VStack>
	);
}
