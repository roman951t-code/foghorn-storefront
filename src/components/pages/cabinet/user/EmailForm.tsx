import { Input, Field, VStack, Stack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import EmailVerification from './EmailVerification';

interface Props {
	isEmailVerified: boolean;
	userEmail: string;
	emailForm: UseFormReturn<
		{
			email: any;
		},
		unknown,
		{
			email: string;
		}
	>;
	i18nData: I18nData;
}

export default function EmailForm({ i18nData, userEmail, emailForm, isEmailVerified }: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	const [isPending, setIsPending] = useState(false);
	const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
	const [error, setError] = useState('');
	// const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [newEmail, setNewEmail] = useState<string | null>(null);

	// const handleAddEmail = async (data: { email: string }) => {
	// 	setIsPending(true);

	// 	const result = await authClient.changeEmail({
	// 		newEmail: data.email,
	// 		callbackURL: '/?email-change=true',
	// 	});

	// 	if (result?.error) {
	// 		setError(i18nData.editEmailFail);
	// 	} else {
	// 		setVerifOpen(true);
	// 	}

	// 	setIsPending(false);
	// };

	const verifyEmail = async (data: { email: string }) => {
		// if (userEmail === data.email) {
		// 	return;
		// }

		setIsPending(true);

		const result = await authClient.emailOtp.sendVerificationOtp({
			email: data.email,
			type: 'email-verification',
		});
		if (result?.data?.success) {
			setNewEmail(data.email);
			setVerifyEmailOpen(true);
		} else {
			setError(i18nData.editEmailFail);
		}

		setIsPending(false);
	};

	const isInvalid =
		!!emailForm.formState.errors.email || !!error || (!isEmailVerified && !!userEmail);

	return (
		<form onSubmit={emailForm.handleSubmit(verifyEmail)}>
			<Field.Root orientation={fieldOrientation} invalid={isInvalid} justifyContent='center'>
				<Field.Label maxH='20px'>{i18nData.email}</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as any} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input {...emailForm.register('email')} variant='outline' size='md' />

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
							closeOnInteractOutside={false}
							title={i18nData.editEmail}
							trigger={
								<SecondaryButton type='submit' loading={isPending} mt={{ base: '2', sm: '0' }}>
									{i18nData.save}
								</SecondaryButton>
							}
							size='md'
							open={verifyEmailOpen && !error}
							setIsOpen={() => false}
						>
							<EmailVerification email={newEmail!} i18nData={i18nData} />
						</CenteredModal>

						{/* {!!userEmail && !isEmailVerified && (
							<CenteredModal
								closeOnInteractOutside={false}
								title={i18nData.emailConfirmation}
								trigger={
									<SecondaryButton mt={{ base: '2', sm: '0' }} loading={isPending} type='submit'>
										{i18nData.sendVerifEmail}
									</SecondaryButton>
								}
								size='md'
								open={isVerifOpen && !error}
								setIsOpen={setVerifOpen}
							>
								<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
									{i18nData.toPost}
									<Highlight
										query={emailForm.watch('email')}
										styles={{ fontWeight: 'semibold', mx: 1.5 }}
									>
										{emailForm.watch('email')}
									</Highlight>
									<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
								</Fieldset.HelperText>
							</CenteredModal>
						)} */}
					</VStack>
				</Stack>
			</Field.Root>
		</form>
	);
}
