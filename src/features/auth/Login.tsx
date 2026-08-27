import { useRef, useState } from 'react';
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
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
	// setState is batched/deferred, so two clicks fired before React re-renders
	// (e.g. a real double-click, or the disabled attribute not having painted
	// yet) can both still read isGoogleSubmitting as false from their own
	// closure. A ref is mutated synchronously, so the second invocation always
	// observes the first one's lock immediately, regardless of render timing.
	const isGoogleSubmittingRef = useRef(false);

	const isPhoneAuth = authMethod === 'phone';
	const isEmailAuth = authMethod === 'email';

	const handleGoogleLogin = async () => {
		// Without this guard, a second click while the first sign-in is still
		// in flight fires a concurrent `signIn.social` call. Each mints its own
		// OAuth `state` + cookie, and whichever pair wins the race to arrive
		// back from Google can end up mismatched — surfacing as a
		// `state_mismatch` redirect even though the other call's session
		// cookie already landed (a reload then shows the user as logged in).
		if (isGoogleSubmittingRef.current) return;
		isGoogleSubmittingRef.current = true;
		setIsGoogleSubmitting(true);
		try {
			const url = new URL(window.location.href);
			url.searchParams.set('auth', 'google');
			const { error } = await signIn.social({
				provider: 'google',
				callbackURL: url.toString(),
			});
			if (error) {
				showToaster('error', error.message || i18nData.userLoginFail);
			}
		} finally {
			isGoogleSubmittingRef.current = false;
			setIsGoogleSubmitting(false);
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
					loading={isGoogleSubmitting}
					disabled={isGoogleSubmitting}
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
