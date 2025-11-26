import { useState } from 'react';
import { Stack, Icon, CheckboxCard, Link as ChakraLink } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdArrowBack, IoMdPhonePortrait } from 'react-icons/io';
import { Link } from '@/i18n/routing';
import { signIn } from '@/lib/auth-client';
import { TertiaryButton } from '../reusable/buttons/ActionButton';
import PhoneSignUp from './PhoneSignUp';
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
			{isPhoneAuth && <PhoneSignUp i18nData={i18nData} disabled={!termsAccepted} />}
			{isEmailAuth && (
				<EmailSignUp i18nData={i18nData} disabled={!termsAccepted} backToLogin={backToLogin} />
			)}
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
				<TertiaryButton
					disabled={!termsAccepted}
					gap='2.5'
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
				</TertiaryButton>
				{isPhoneAuth && (
					<TertiaryButton gap='2.5' onClick={() => setAuthMethod('email')}>
						<IoMailOutline />
						{i18nData.continueWithEmail}
					</TertiaryButton>
				)}
				{isEmailAuth && (
					<TertiaryButton gap='2.5' onClick={() => setAuthMethod('phone')}>
						<IoMdPhonePortrait />
						{i18nData.continueWithPhone}
					</TertiaryButton>
				)}
			</Stack>

			<TertiaryButton mt={12} w='100%' onClick={backToLogin}>
				<IoMdArrowBack />
				{i18nData.backToLogin}
			</TertiaryButton>
		</>
	);
}
