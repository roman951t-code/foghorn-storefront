import { Input, Field, VStack, Fieldset, Highlight, Text, Stack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Props {
	error?: { message?: string };
	isEmailVerified: boolean;
	pending: boolean;
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
	onAddEmailAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
	onEditEmailAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
	isOpen: boolean;
	setIsOpenAction: (val: boolean) => void;
	refreshSession: () => void;
}

export default function EmailForm({
	i18nData,
	error,
	isOpen,
	setIsOpenAction,
	pending,
	userEmail,
	emailForm,
	isEmailVerified,
	refreshSession,
	onAddEmailAction,
	onEditEmailAction,
}: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };
	const isInvalid = !!emailForm.formState.errors.email || !!error?.message || !isEmailVerified;

	const [isVerifOpen, setVerifOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	useEffect(() => {
		if (!emailSignIn) return;

		const handleEmailSignIn = async () => {
			const current = new URLSearchParams(window.location.search);
			current.delete('email-sign-in');
			const newSearch = current.toString();
			const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
			router.replace(newPath);

			await refreshSession();
		};

		handleEmailSignIn();
	}, [emailSignIn]);

	const handleEmailVerify = async () => {
		setIsPending(true);
		await onAddEmailAction();
		setIsPending(false);
	};

	return (
		<form onSubmit={userEmail ? onEditEmailAction : onAddEmailAction}>
			<Field.Root orientation={fieldOrientation} invalid={isInvalid} justifyContent='center'>
				<Field.Label maxH='20px'>{i18nData.email}</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as any} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input {...emailForm.register('email')} variant='outline' size='md' />

						<Field.ErrorText>
							{emailForm.formState.errors.email?.message?.toString() || error?.message}
						</Field.ErrorText>
						{!isEmailVerified && (
							<>
								<Field.ErrorText>{i18nData.emailNotVerifiedError}</Field.ErrorText>
							</>
						)}
					</VStack>
					<VStack alignItems='stretch'>
						<CenteredModal
							closeOnInteractOutside={false}
							title={i18nData.editEmail}
							trigger={
								<SecondaryButton type='submit' loading={pending} mt={{ base: '2', sm: '0' }}>
									{i18nData.save}
								</SecondaryButton>
							}
							size='md'
							open={isOpen}
							setIsOpen={setIsOpenAction}
						>
							<Fieldset.Root size='lg' invalid>
								<Fieldset.Content>
									<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
										{i18nData.toPost}
										<Highlight query={userEmail} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
											{userEmail}
										</Highlight>
										<Text color='fg.muted'>{i18nData.editEmailCodeSent}</Text>
									</Fieldset.HelperText>
								</Fieldset.Content>
							</Fieldset.Root>
						</CenteredModal>
						{!isEmailVerified && (
							<CenteredModal
								closeOnInteractOutside={false}
								title={i18nData.emailConfirmation}
								trigger={
									<SecondaryButton
										mt={{ base: '2', sm: '0' }}
										loading={isPending}
										onClick={handleEmailVerify}
									>
										{i18nData.sendVerifEmail}
									</SecondaryButton>
								}
								size='md'
								open={isVerifOpen}
								setIsOpen={setVerifOpen}
							>
								<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
									{i18nData.toPost}
									<Highlight query={userEmail} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
										{userEmail}
									</Highlight>
									<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
								</Fieldset.HelperText>
							</CenteredModal>
						)}
					</VStack>
				</Stack>
			</Field.Root>
		</form>
	);
}
