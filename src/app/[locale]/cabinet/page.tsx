import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';

export default function Cabinet() {
	const t = useTranslations('Auth');

	const i18nData = extractI18nData(t, [
		'name',
		'email',
		'phone',
		'shipmentAddress',
		'preferredNotificationWay',
		'save',
	]);

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('personalData')}
			</Heading>
			<PersonalDataForm i18nData={i18nData} />
		</VStack>
	);
}
