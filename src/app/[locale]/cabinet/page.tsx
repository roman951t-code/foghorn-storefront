import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';
import { accountAuthLoc, accountValidLoc } from '@/data/localized';

export default function Cabinet() {
	const authT = useTranslations('Auth');
	const validT = useTranslations('Validation');

	const validI18nData = extractI18nData(validT, accountValidLoc);
	const authI18nData = extractI18nData(authT, accountAuthLoc);

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
