import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from './_components/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';
import {
	ACCOUNT_AUTH_MESSAGE_KEYS,
	ACCOUNT_VALIDATION_MESSAGE_KEYS,
} from '@/data/localeMessages/authMessages';

export default function Cabinet() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');

	const validI18nData = extractI18nData(validT, ACCOUNT_VALIDATION_MESSAGE_KEYS);
	const authI18nData = extractI18nData(authT, ACCOUNT_AUTH_MESSAGE_KEYS);

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
