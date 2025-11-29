'use client';

import { useSession } from '@/providers/SessionProvider';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { I18nData } from '@/types/i18n';
import { Heading, Flex, Field, Input, Fieldset } from '@chakra-ui/react';
import { IoMailOutline } from 'react-icons/io5';
import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import {
	createEmailSubscribeSchema,
	EmailSchema,
} from 'formValidationSchemas/emailSubscribeSchema';
import { subscribeNewsletterAction } from '@/actions/newsletter/subscribeNewsletterAction';
import { sendVerifyEmailAction } from '@/actions/auth/sendVerifyEmailAction';
import { unsubscribeNewsletterAction } from '@/actions/newsletter/unsubscribeNewsletterAction';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import EmailVerification from 'app/[locale]/cabinet/_components/user/EmailVerification';

type Props = {
	i18nData: I18nData;
};

const MAX_CHARACTERS = 60;

const SubscribeButton = ({
	subscribeText,
	isPending,
	disabled,
}: {
	subscribeText: string;
	isPending: boolean;
	disabled?: boolean;
}) => (
	<PrimaryButton
		type='submit'
		minW='280px'
		maxW='340px'
		w={{ base: '100%', md: 'auto' }}
		flexShrink={0}
		loading={isPending}
		disabled={disabled}
	>
		<IoMailOutline />
		{subscribeText}
	</PrimaryButton>
);

export default function SubscribeSection({ i18nData }: Props) {
	const { session, refresh } = useSession();

	const [isTransition, startTransition] = useTransition();
	const [isPending, setIsPending] = useState(false);
	const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
	const [verifyError, setVerifyError] = useState('');
	const [newEmail, setNewEmail] = useState<string | null>(null);

	const emailSchema = useMemo(() => createEmailSubscribeSchema(i18nData), [i18nData]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EmailSchema>({
		defaultValues: { email: session?.user?.email ?? '' },
		mode: 'onSubmit',
		resolver: zodResolver(emailSchema),
	});

	const isEmailVerified = session?.user?.email && session?.user?.emailVerified;
	const isUserSubscribed = session?.user?.subscribed;

	const onSubmit = async (formData: EmailSchema) => {
		// if (userEmail === data.email) {
		// 	return;
		// }

		setIsPending(true);

		try {
			const result = await sendVerifyEmailAction(null, formData);

			if (!result?.success) {
				setVerifyError(i18nData.editEmailFail);
			} else {
				setNewEmail(formData.email);
				setVerifyEmailOpen(true);
			}
		} catch {
			setVerifyError(i18nData.editEmailFail);
		} finally {
			setIsPending(false);
		}
	};

	const subscribeNewsletter = () => {
		if (!session?.user?.email) return;

		startTransition(async () => {
			const result = await subscribeNewsletterAction(null, {
				email: session.user.email,
				name: session.user.name ?? '',
			});
			if (result.success) {
				showToaster('success', toasterMessages.newsletterSubscribeSuccess(i18nData));
				await refresh();
			} else {
				showToaster('error', toasterMessages.newsletterSubscribeFail(i18nData, result.message));
			}
		});
	};

	const unSubscribeNewsletter = () => {
		if (!session?.user?.email) return;

		startTransition(async () => {
			const result = await unsubscribeNewsletterAction(null, {
				email: session.user.email,
			});
			if (result.success) {
				showToaster('success', toasterMessages.newsletterUnsubscribeSuccess(i18nData));
				await refresh();
			} else {
				showToaster('error', toasterMessages.newsletterUnsubscribeFail(i18nData, result.message));
			}
		});
	};

	if (!session?.session) {
		return null;
	}

	return (
		<Flex
			mt={24}
			bg='bg.dark'
			p={4}
			rounded='md'
			boxShadow='sm'
			gapX='8'
			gapY='4'
			flexWrap='wrap'
			alignItems='center'
			justifyContent={{ base: 'center', '2xl': 'space-between' }}
		>
			<Heading color='main' fontWeight='normal' size='lg' minW='260px'>
				{isUserSubscribed ? i18nData.subscribed : i18nData.subscribeInfo}
			</Heading>

			{!isEmailVerified && (
				<form onSubmit={handleSubmit(onSubmit)} style={{ width: 'auto' }}>
					<Flex
						gap='4'
						alignItems='flex-start'
						justifyContent={{ base: 'center', md: 'flex-end' }}
						minWidth='280px'
						flexWrap='wrap'
					>
						<Fieldset.Root invalid w={{ base: 'full', md: 'auto' }} maxW='340px'>
							<Field.Root required invalid={!!errors?.email || !!verifyError}>
								<Input
									{...register('email')}
									maxLength={MAX_CHARACTERS}
									rounded='md'
									type='email'
									placeholder={i18nData.email}
									size='md'
									minH='44px'
									fontSize='md'
									variant='outline'
									minWidth='280px'
									maxWidth='340px'
									flex='1 1 0'
									disabled={session?.user?.isGoogleUser}
									readOnly={session?.user?.isGoogleUser}
								/>

								<Field.ErrorText minH='22px'>
									{errors.email?.message || verifyError || i18nData.emailNotVerifiedError}
								</Field.ErrorText>
							</Field.Root>
						</Fieldset.Root>
						<CenteredModal
							dialogId='subscribe-modal'
							closeOnInteractOutside={false}
							title={i18nData.subscribeProcedure}
							trigger={
								<SubscribeButton
									subscribeText={i18nData.verifyEmail}
									isPending={isPending}
									disabled={session?.user?.isGoogleUser && !session?.user?.emailVerified}
								/>
							}
							size='md'
							open={verifyEmailOpen && !verifyError}
							setIsOpen={setVerifyEmailOpen}
						>
							<EmailVerification
								email={newEmail!}
								i18nData={i18nData}
								onClose={() => setVerifyEmailOpen(false)}
							/>
						</CenteredModal>
					</Flex>
				</form>
			)}
			{isEmailVerified && (
				<form
					action={isUserSubscribed ? unSubscribeNewsletter : subscribeNewsletter}
					style={{ display: 'inline-block', width: 'auto' }}
				>
					<SubscribeButton
						subscribeText={isUserSubscribed ? i18nData.unsubscribe : i18nData.subscribe}
						isPending={isTransition}
						disabled={session?.user?.isGoogleUser && !session?.user?.emailVerified}
					/>
				</form>
			)}
		</Flex>
	);
}
