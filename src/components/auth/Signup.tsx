import React, { useState } from 'react';
import { Button, Stack, Icon, CheckboxCard, Link as ChakraLink } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdArrowBack, IoMdPhonePortrait } from 'react-icons/io';
import { Link } from '@/i18n/routing';
import PhoneAuth from './PhoneAuth';
import { signIn } from '@/lib/auth-client';
import EmailSignUp from './EmailSignUp';

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
					// onSubmitAction={({ email, password }) => null}
					isSignup
				/>
			)}
			{isEmailAuth && <EmailSignUp i18nData={i18nData} disabled={!termsAccepted} />}
			<CheckboxCard.Root
				onChange={() => setTermsAccepted(!termsAccepted)}
				css={{
					'& svg[data-state="unchecked"]': {
						color: 'var(--chakra-colors-fg) !important',
					},
				}}
				mt='6'
				colorPalette='gray'
				_hover={{ cursor: 'pointer' }}
			>
				<CheckboxCard.HiddenInput />
				<CheckboxCard.Control>
					<CheckboxCard.Label>
						{i18nData.accept}
						<Link href='/terms' target='blank'>
							<ChakraLink
								as='span'
								fontSize='15px'
								textDecoration='underline'
								textUnderlineOffset='3px'
								transition='all .15s ease-in-out'
								textDecorationColor='main'
								_hover={{ color: 'link' }}
								_focus={{ outline: 'none' }}
							>
								{i18nData.acceptTerms}
							</ChakraLink>
						</Link>
					</CheckboxCard.Label>
					<CheckboxCard.Indicator />
				</CheckboxCard.Control>
			</CheckboxCard.Root>
			<Stack gap={4} mt={12}>
				<Button
					disabled={!termsAccepted}
					gap='12px'
					variant='outline'
					borderColor='main'
					onClick={async () => {
						await signIn.social({
							provider: 'google',
						});
					}}
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
