'use client';

import { Fieldset, Highlight, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import CenteredModal from '../dialogs/CenteredModal';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useTranslations } from 'next-intl';

export default function UpdateEmailModal() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	const emailChange = searchParams?.get('email-change') === 'true';
	const [isOpen, setIsOpen] = useState(false);

	const errorMap: Record<string, string> = {
		'Invalid password': validT('invalidFormData'),
		'User not found': validT('userNotFound'),
		'Too many attempts': validT('tooManyAttempts'),
	};

	useEffect(() => {
		if (!emailChange) return;

		const sendVerification = async () => {
			if (session?.user.email) {
				const { error } = await authClient.sendVerificationEmail({
					email: session.user.email,
					callbackURL: '/?email-sign-in=true',
				});

				if (error) {
					const messageKey = error?.message ?? '';
					const message = errorMap[messageKey] || validT('editEmailFail');
					showToaster('error', toasterMessages.updateEmailFailed(message));
				} else {
					setIsOpen(true);
				}
			}
		};

		sendVerification();
	}, [emailChange, session]);

	if (!isOpen) return null;

	return (
		<CenteredModal
			dialogId='update-email-modal'
			closeOnInteractOutside={false}
			title={authT('editEmail')}
			trigger={null}
			size='md'
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Content>
					{session?.user.email && (
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
							{authT('toNewPost')}

							<Highlight query={session?.user.email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
								{session?.user.email}
							</Highlight>

							<Text color='fg.muted'>{authT('editEmailCodeSent')}</Text>
						</Fieldset.HelperText>
					)}
				</Fieldset.Content>
			</Fieldset.Root>
		</CenteredModal>
	);
}
