import React, { useState } from 'react';
import { Button, Stack } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import EmailAuth from './EmailAuth';
// import { signIn, useSession } from 'next-auth/react';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import PhoneAuth from './PhoneAuth';

interface Props {
	i18nData: I18nData;
	moveToSignup: () => void;
}

export default function Login({ i18nData, moveToSignup }: Props) {
	const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

	const isPhoneAuth = authMethod === 'phone';
	const isEmailAuth = authMethod === 'email';

	return (
		<>
			{isPhoneAuth && (
				<PhoneAuth i18nData={i18nData} onSubmitAction={({ email, password }) => null} />
			)}
			{isEmailAuth && (
				<EmailAuth
					onSubmitAction={
						({ email, password }) => false
						// signIn('email-credentials', { email, password, redirect: false })
					}
					i18nData={i18nData}
				/>
			)}

			<Stack gap={4} mt={12}>
				<Button gap='12px' variant='outline' borderColor='main' onClick={() => false}>
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
