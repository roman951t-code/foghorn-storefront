'use client';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSession } from '../providers/SessionProvider';
import { PrimaryButton } from '../reusable/buttons/ActionButton';
import Signup from './Signup';
import Login from './Login';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { I18nData } from '@/types/i18n';

const emptyCart = '/assets/images/emptyCart.png';

const authKeys = [
	'name',
	'phone',
	'authorize',
	'continueWith',
	'logOut',
	'email',
	'password',
	'continue',
	'rememberPass',
	'resetPassAction',
	'accept',
	'acceptTerms',
	'signUp',
	'phoneNumber',
	'backToLogin',
	'register',
	'continueWithEmail',
	'sendOtp',
	'confirmPassword',
	'continueWithPhone',
	'resendAfter',
	'resendCode',
	'phoneConfirmation',
	'emailConfirmation',
	'confirmPhone',
	'confirmEmail',
	'activationCodeSent',
	'signUpCodeSent',
	'continuePurchases',
	'returnCongrats',
	'preferredNotificationWay',
	'pin',
	'toPost',
	'hiUser',
	'toNewPost',
	'editEmailCodeSent',
	'editPhone',
	'resetPassConfirm',
	'emailConfirmed',
	'resetPassCodeSent',
	'renewPass',
	'saveNewPass',
	'editEmail',
	'save',
	'shipmentAddress',
	'newPass',
	'passUpdated',
	'sendVerifEmail',
	'close',
	'middleName',
	'nameUpdated',
	'notifUpdated',
	'lastName',
	'authToOrder',
	'yourContacts',
];

const validationKeys = [
	'wrongEmail',
	'emailRequired',
	'inputMaxLength',
	'passwordRequired',
	'passwordMin',
	'userLoginFail',
	'passwordMax',
	'passwordUppercase',
	'passwordLowercase',
	'editEmailFail',
	'passwordAlphabetic',
	'passwordUnderscore',
	'phoneRequired',
	'invalidPhone',
	'invalidFormData',
	'smsSendFailed',
	'userExists',
	'userRegisterFail',
	'passwordsNotMatch',
	'nameMinLength',
	'pinRequired',
	'userNotFound',
	'refreshTokenError',
	'alreadyVerified',
	'verificationFailed',
	'emailNotVerifiedError',
	'pinLength',
	'invalidOtp',
	'otpExpired',
	'tooManyAttempts',
	'lastNameRequired',
	'middleNameRequired',
	'emailNotVerified',
	'preferedNotifFailed',
	'editNameFail',
	'setNewPassFail',
];

interface Props {
	trigger?: JSX.Element;
	isOpen?: boolean;
	setIsOpen?: (value: boolean) => void;
}

export default function Auth({ trigger, isOpen, setIsOpen }: Props) {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');
	const { session, refresh } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const i18nData = useMemo<I18nData>(() => {
		const authEntries = authKeys.map((key) => [key, authT(key)]);
		const validationEntries = validationKeys.map((key) => [key, validT(key)]);
		return Object.fromEntries([...authEntries, ...validationEntries]);
	}, [authT, validT]);

	const [showSignup, setShowSignup] = useState(false);
	const [isAuthOpen, setAuthOpen] = useState(false);

	const refreshSession = async () => {
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
	};

	useEffect(() => {
		if (!emailSignIn) return;

		if (emailSignIn) {
			const handleEmailSignIn = async () => {
				const current = new URLSearchParams(window.location.search);
				current.delete('email-sign-in');
				const newSearch = current.toString();
				const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
				router.replace(newPath);

				await refreshSession();
			};

			handleEmailSignIn();
			setAuthOpen(true);
		}
	}, [emailSignIn]);

	const toggleSignup = () => {
		setShowSignup((prevState) => !prevState);
	};

	const handleCloseClick = () => {
		if (setIsOpen) {
			setIsOpen(false);
		}
		if (setAuthOpen) {
			setAuthOpen(false);
		}
	};

	const title = session?.session
		? `${i18nData.returnCongrats}, ${session?.user?.name}!`
		: showSignup
			? i18nData.register
			: i18nData.authorize;

	return (
		<CenteredModal
			dialogId='auth-modal'
			closeOnInteractOutside={false}
			title={`${title}`}
			trigger={trigger}
			size='md'
			open={isOpen ?? isAuthOpen}
			setIsOpen={setIsOpen ?? setAuthOpen}
		>
			<Box maxW='400px' mx='auto' my='auto'>
				{!session?.session && (
					<>
						{showSignup ? (
							<Signup i18nData={i18nData} backToLogin={toggleSignup} />
						) : (
							<Login i18nData={i18nData} moveToSignup={toggleSignup} />
						)}
					</>
				)}

				{session?.session && (
					<VStack gap='8'>
						<Image
							src={emptyCart}
							width='230'
							height='230'
							alt='empty cart'
							style={{
								objectFit: 'cover',
								width: '230px',
								height: '230px',
								marginLeft: -45,
							}}
						/>
						<PrimaryButton onClick={handleCloseClick} w='100%' type='submit'>
							{i18nData.continuePurchases}
						</PrimaryButton>
					</VStack>
				)}
			</Box>
		</CenteredModal>
	);
}
