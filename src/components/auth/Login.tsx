import React, { useState } from 'react';
import { Button, Stack } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import PhoneSignIn from './PhoneSignIn';
import { signIn } from '@/lib/auth-client';
import EmailSignIn from './EmailSignIn';
import { useSession } from '../providers/SessionProvider';

interface Props {
	i18nData: I18nData;
	moveToSignup: () => void;
}

export default function Login({ i18nData, moveToSignup }: Props) {
	const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
	const { refresh } = useSession();

	const isPhoneAuth = authMethod === 'phone';
	const isEmailAuth = authMethod === 'email';

	return (
		<>
			{isPhoneAuth && <PhoneSignIn i18nData={i18nData} />}
			{isEmailAuth && <EmailSignIn i18nData={i18nData} />}

			<Stack gap={4} mt={12}>
				<Button
					gap='12px'
					variant='outline'
					borderColor='main'
					onClick={async () => {
						await signIn.social({
							provider: 'google',
							callbackURL: window.location.href,
						});

						await refresh();

						const bc = new BroadcastChannel('auth');
						bc.postMessage('session-updated');
						bc.close();
					}}
				>
					<FcGoogle />
					{i18nData.continueWith} Google
				</Button>
				{isPhoneAuth && (
					<Button
						gap='12px'
						variant='outline'
						borderColor='main'
						onClick={() => setAuthMethod('email')}
					>
						<IoMailOutline />
						{i18nData.continueWithEmail}
					</Button>
				)}
				{isEmailAuth && (
					<Button
						gap='12px'
						variant='outline'
						borderColor='main'
						onClick={() => setAuthMethod('phone')}
					>
						<IoMdPhonePortrait />
						{i18nData.continueWithPhone}
					</Button>
				)}
			</Stack>

			<Button w='100%' mt={12} variant='outline' borderColor='main' onClick={moveToSignup}>
				{i18nData.signUp}
			</Button>
		</>
	);
}
