import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';

export default function Cabinet() {
	const authT = useTranslations('Auth');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{authT('personalData')}
			</Heading>
			<PersonalDataForm />
		</VStack>
	);
}
