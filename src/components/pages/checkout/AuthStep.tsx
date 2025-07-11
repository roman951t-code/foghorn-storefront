import { Card } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { extractI18nData } from '@/utils/i18nUtils';
import { authLocData, validLocData } from '@/data/localized';
import AuthData from './AuthData';

export default function AuthStep() {
	const authT = useTranslations('Auth');
	const validT = useTranslations('Validation');

	const authI18nData = extractI18nData(authT, authLocData);
	const validI18nData = extractI18nData(validT, validLocData);

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
