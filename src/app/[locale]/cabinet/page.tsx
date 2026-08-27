import { Suspense } from 'react';
import { VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from './_components/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';
import {
	ACCOUNT_AUTH_MESSAGE_KEYS,
	ACCOUNT_VALIDATION_MESSAGE_KEYS,
} from '@/data/localeMessages/authMessages';
import CabinetPageContentSkeleton from '@/components/ui/skeletons/CabinetPageContentSkeleton';

export default function Cabinet() {
	return (
		<Suspense fallback={<CabinetPageContentSkeleton />}>
			<CabinetForm />
		</Suspense>
	);
}

function CabinetForm() {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');

	const validI18nData = extractI18nData(validT, ACCOUNT_VALIDATION_MESSAGE_KEYS);
	const authI18nData = extractI18nData(authT, ACCOUNT_AUTH_MESSAGE_KEYS);

	const i18nData = {
		...authI18nData,
		...validI18nData,
	};

	return (
		<VStack w='100%' maxW='6xl' mx='auto'>
			<PersonalDataForm i18nData={i18nData} />
		</VStack>
	);
}
