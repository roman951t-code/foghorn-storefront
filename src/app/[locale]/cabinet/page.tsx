import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from './_components/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';

const accountAuthKeys = [
	'name',
	'email',
	'phone',
	'shipmentAddress',
	'save',
	'editEmail',
	'editPhone',
	'toPost',
	'emailConfirmation',
	'resendAfter',
	'resendCode',
	'confirmPhone',
	'editEmailCodeSent',
	'nameUpdated',
	'emailUpdated',
	'sendOtp',
	'phoneUpdated',
	'confirmEmail',
	'middleName',
	'sendVerifEmail',
	'hiUser',
	'lastName',
	'updateCodeSent',
	'signUpCodeSent',
	'newPass',
];

const accountValidKeys = [
	'nameRequired',
	'wrongEmail',
	'emailRequired',
	'phoneRequired',
	'invalidPhone',
	'invalidFormData',
	'nameMinLength',
	'userNotFound',
	'addressMax',
	'userLoginFail',
	'editNameFail',
	'editEmailFail',
	'lastNameRequired',
	'tooManyAttempts',
	'middleNameRequired',
	'emailNotVerifiedError',
];

export default function Cabinet() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');

	const validI18nData = extractI18nData(validT, accountValidKeys);
	const authI18nData = extractI18nData(authT, accountAuthKeys);

	const i18nData = {
		...authI18nData,
		...validI18nData,
	};

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal'>
				{authT('personalData')}
			</Heading>
			<PersonalDataForm i18nData={i18nData} />
		</VStack>
	);
}
