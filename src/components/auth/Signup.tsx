import React, { useState } from 'react';
import { Button, Stack, Icon, CheckboxCard } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import EmailAuth from './EmailAuth';
import { signIn } from 'next-auth/react';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdArrowBack, IoMdPhonePortrait } from 'react-icons/io';
import PhoneAuth from './PhoneAuth';

interface Props {
	i18nData: I18nData;
	backToLogin: () => void;
}

export default function Signup({ i18nData, backToLogin }: Props) {
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

	const isPhoneAuth = authMethod === 'phone';
	const isEmailAuth = authMethod === 'email';

	return (
		<>
			{isPhoneAuth && (
				<PhoneAuth
					i18nData={i18nData}
					disabled={!termsAccepted}
					onSubmitAction={({ email, password }) => null}
					isSignup
				/>
			)}
			{isEmailAuth && (
				<EmailAuth
					onSubmitAction={({ email, password }) =>
						signIn('credentials', { email, password, redirect: false })
					}
					i18nData={i18nData}
					disabled={!termsAccepted}
					isSignup
				/>
			)}

			<Stack gap={4} mt={12}>
				<Button
					disabled={!termsAccepted}
					gap='12px'
					variant='outline'
					borderColor='main'
					onClick={() => signIn('google')}
				>
					<Icon size='md'>
						<FcGoogle />
					</Icon>
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

			<CheckboxCard.Root
				onChange={() => setTermsAccepted(!termsAccepted)}
				css={{
					'& svg[data-state="unchecked"]': {
						color: 'var(--chakra-colors-fg) !important',
					},
				}}
				mt='8'
				colorPalette='gray'
				_hover={{ cursor: 'pointer' }}
			>
				<CheckboxCard.HiddenInput />
				<CheckboxCard.Control>
					<CheckboxCard.Label>{i18nData.acceptTerms}</CheckboxCard.Label>
					<CheckboxCard.Indicator />
				</CheckboxCard.Control>
			</CheckboxCard.Root>
			<Button
				mt={12}
				w='100%'
				variant='outline'
				border='1px solid'
				borderColor='border'
				onClick={backToLogin}
			>
				<IoMdArrowBack />
				{i18nData.backToLogin}
			</Button>
		</>
	);
}
