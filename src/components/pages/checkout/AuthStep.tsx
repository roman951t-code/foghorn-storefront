import { Card } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { extractI18nData } from '@/utils/i18nUtils';
import AuthData from './AuthData';

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

export default function AuthStep() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');

	const authI18nData = extractI18nData(authT, authKeys);
	const validI18nData = extractI18nData(validT, validationKeys);

	const i18nData = {
		...authI18nData,
		...validI18nData,
		authToOrder: authT('authToOrder'),
		authorize: authT('authorize'),
		yourContacts: authT('yourContacts'),
	};

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' p='4'>
			<AuthData i18nData={i18nData} />
		</Card.Root>
	);
}
