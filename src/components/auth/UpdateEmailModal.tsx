'use client';

import { Fieldset, Highlight, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { I18nData } from '@/types/i18n';
import CenteredModal from '../dialogs/CenteredModal';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toaster } from '../reusable/chakra/toaster';

interface ResetPassProps {
	i18nData: I18nData;
}

export default function UpdateEmailModal({ i18nData }: ResetPassProps) {
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	const emailChange = searchParams?.get('email-change') === 'true';
	const [isOpen, setIsOpen] = useState(false);

	const errorMap: Record<string, string> = {
		'Invalid password': i18nData.invalidFormData,
		'User not found': i18nData.userNotFound,
		'Too many attempts': i18nData.tooManyAttempts,
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
					const message = errorMap[messageKey] || i18nData.editEmailFail;
					toaster.error({
						title: message,
						duration: 5000,
					});
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
			closeOnInteractOutside={false}
			title={i18nData.editEmail}
			trigger={null}
			size='md'
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Content>
					{session?.user.email && (
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
							{i18nData.toNewPost}

							<Highlight query={session?.user.email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
								{session?.user.email}
							</Highlight>

							<Text color='fg.muted'>{i18nData.editEmailCodeSent}</Text>
						</Fieldset.HelperText>
					)}
				</Fieldset.Content>
			</Fieldset.Root>
		</CenteredModal>
	);
}
