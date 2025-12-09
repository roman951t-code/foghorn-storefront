import { Card } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { extractI18nData } from '@/utils/i18nUtils';
import AuthData from './AuthData';
import { AUTH_MESSAGE_KEYS, VALIDATION_MESSAGE_KEYS } from '@/data/localeMessages/authMessages';

export default function AuthStep() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');

	const authI18nData = extractI18nData(authT, AUTH_MESSAGE_KEYS);
	const validI18nData = extractI18nData(validT, VALIDATION_MESSAGE_KEYS);

	const i18nData = {
		...authI18nData,
		...validI18nData,
		authToOrder: authT('authToOrder'),
		authorize: authT('authorize'),
	};

	return (
		<Card.Root size='sm' bg='none' border='none' alignItems='flex-start'>
			<AuthData i18nData={i18nData} />
		</Card.Root>
	);
}
