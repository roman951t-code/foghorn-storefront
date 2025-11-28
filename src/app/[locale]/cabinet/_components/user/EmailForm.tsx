import { Input, Field, VStack, Stack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { useState } from 'react';
import EmailVerification from './EmailVerification';
import { sendVerifyEmailAction } from '@/actions/auth/sendVerifyEmailAction';
import { EmailSchema } from 'formValidationSchemas/emailSubscribeSchema';

interface Props {
isEmailVerified: boolean;
userEmail: string;
isGoogleUser?: boolean;
emailForm: UseFormReturn<
	{
		email: string;
		},
		unknown,
		{
			email: string;
		}
	>;
	i18nData: I18nData;
}

export default function EmailForm({
	i18nData,
	userEmail,
	emailForm,
	isEmailVerified,
	isGoogleUser,
}: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	const [isPending, setIsPending] = useState(false);
	const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
	const [error, setError] = useState('');
	const [newEmail, setNewEmail] = useState<string | null>(null);

	const onSubmit = async (formData: EmailSchema) => {
		// if (userEmail === data.email) {
		// 	return;
		// }

		setIsPending(true);

		try {
			const result = await sendVerifyEmailAction(null, formData);

			if (!result?.success) {
				setError(i18nData.editEmailFail);
			} else {
				setNewEmail(formData.email);
				setVerifyEmailOpen(true);
			}
		} catch {
			setError(i18nData.editEmailFail);
		} finally {
			setIsPending(false);
		}
	};

	const isInvalid =
		!!emailForm.formState.errors.email || !!error || (!isEmailVerified && !!userEmail);

	return (
		<form onSubmit={emailForm.handleSubmit(onSubmit)}>
			<Field.Root orientation={fieldOrientation} invalid={isInvalid} justifyContent='center'>
				<Field.Label maxH='20px'>{i18nData.email}</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as const} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input
							{...emailForm.register('email')}
							variant='outline'
							size='md'
							disabled={isGoogleUser}
							readOnly={isGoogleUser}
						/>

						<Field.ErrorText>
							{emailForm.formState.errors.email?.message?.toString()}
						</Field.ErrorText>
						{!isEmailVerified && !!userEmail && (
							<>
								<Field.ErrorText>{error || i18nData.emailNotVerifiedError}</Field.ErrorText>
							</>
						)}
					</VStack>
					<VStack alignItems='stretch'>
						<CenteredModal
							dialogId='email-form-verify-modal'
							closeOnInteractOutside={false}
							title={i18nData.editEmail}
							trigger={
								<SecondaryButton
									type='submit'
									loading={isPending}
									mt={{ base: '2', sm: '0' }}
									disabled={isGoogleUser}
								>
									{i18nData.save}
								</SecondaryButton>
							}
							size='md'
							open={verifyEmailOpen && !!newEmail && !error}
							setIsOpen={setVerifyEmailOpen}
						>
							<EmailVerification
								email={newEmail!}
								i18nData={i18nData}
								onClose={() => setVerifyEmailOpen(false)}
							/>
						</CenteredModal>
					</VStack>
				</Stack>
			</Field.Root>
		</form>
	);
}
