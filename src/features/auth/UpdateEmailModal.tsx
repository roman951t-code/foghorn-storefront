'use client';

import { Fieldset, Highlight, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useTranslations } from 'next-intl';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import { buildEmailChangeErrorMap, resolveAuthErrorMessage } from '@/constants/auth';

export default function UpdateEmailModal() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	const emailChange = searchParams?.get('email-change') === 'true';
	const [isOpen, setIsOpen] = useState(false);
	const errorMap = useMemo(
		() =>
			buildEmailChangeErrorMap({
				invalidFormData: validT('invalidFormData'),
				userNotFound: validT('userNotFound'),
				tooManyAttempts: validT('tooManyAttempts'),
			}),
		[validT]
	);

	useEffect(() => {
		if (!emailChange) return;

		const sendVerification = async () => {
			if (session?.user.email) {
				const { error } = await authClient.sendVerificationEmail({
					email: session.user.email,
					callbackURL: '/?email-sign-in=true',
				});

				if (error) {
					const message = resolveAuthErrorMessage({
						errorKey: error?.message,
						errorMap,
						fallback: validT('editEmailFail'),
					});
					showToaster('error', toasterMessages.updateEmailFailed(message));
				} else {
					setIsOpen(true);
				}
			}
		};

		sendVerification();
	}, [emailChange, session, errorMap, validT]);

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
