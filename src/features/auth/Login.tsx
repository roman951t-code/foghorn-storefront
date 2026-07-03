import { useState } from 'react';
import { Button, Stack } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import { signIn } from '@/lib/auth-client';
import PhoneSignIn from './PhoneSignIn';
import EmailSignIn from './EmailSignIn';
import { showToaster } from '@/utils/toast';

interface Props {
	i18nData: I18nData;
	moveToSignup: () => void;
}

export default function Login({ i18nData, moveToSignup }: Props) {
	const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

	const isPhoneAuth = authMethod === 'phone';
	const isEmailAuth = authMethod === 'email';

	const handleGoogleLogin = async () => {
		const url = new URL(window.location.href);
		url.searchParams.set('auth', 'google');
		const { error } = await signIn.social({
			provider: 'google',
			callbackURL: url.toString(),
		});
		if (error) {
			showToaster('error', error.message || i18nData.userLoginFail);
		}
	};

	return (
		<>
			{isPhoneAuth && <PhoneSignIn i18nData={i18nData} />}
			{isEmailAuth && <EmailSignIn i18nData={i18nData} />}

			<Stack gap={4} mt={12}>
				<Button
					gap='12px'
					variant='outline'
					borderColor='main'
					rounded='md'
					onClick={handleGoogleLogin}
				>
					<FcGoogle />
					{i18nData.continueWith} Google
				</Button>
				{isPhoneAuth && (
					<Button
						gap='12px'
						variant='outline'
						borderColor='main'
						rounded='md'
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
						rounded='md'
						onClick={() => setAuthMethod('phone')}
					>
						<IoMdPhonePortrait />
						{i18nData.continueWithPhone}
					</Button>
				)}
			</Stack>

			<Button
				w='100%'
				mt={12}
				variant='outline'
				borderColor='main'
				rounded='md'
				onClick={moveToSignup}
			>
				{i18nData.signUp}
			</Button>
		</>
	);
}
