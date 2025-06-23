import { Button, Flex, Heading, Card, VStack } from '@chakra-ui/react';
import Auth from '@/components/auth/Auth';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';
import { FiUserCheck } from 'react-icons/fi';

const localizedData = [
	'name',
	'phone',
	'lastname',
	'authorize',
	'continueWith',
	'logOut',
	'email',
	'password',
	'continue',
	'rememberPass',
	'restorePass',
	'getTemporaryPass',
	'acceptTerms',
	'signUp',
	'phoneNumber',
	'backToLogin',
	'register',
	'continueWithEmail',
	'continueWithPhone',
	'resendAfter',
	'resendCode',
	'phoneConfirmation',
	'confirmPhone',
	'activationCodeSent',
];

export default function AuthStep() {
	const t = useTranslations('Auth');

	const i18nData = extractI18nData(t, localizedData);

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' textAlign='center' p='4'>
			<Card.Header p='0'>
				<Flex
					gap='4'
					flexWrap='wrap'
					alignItems='center'
					justifyContent={{ base: 'center', sm: 'space-between' }}
				>
					<Heading as='h4' size='md'>
						{t('authToOrder')}
					</Heading>
					<Auth
						i18nData={i18nData}
						trigger={
							<Button
								w='220px'
								type='submit'
								bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
								color='black'
								variant='solid'
							>
								<FiUserCheck />
								{t('authorize')}
							</Button>
						}
					/>
				</Flex>
			</Card.Header>

			<VStack w='100%' mt='8' gap='4' direction='column'>
				<Heading as='h4' size='md' w='100%' textAlign='left'>
					{t('yourContacts')}
				</Heading>
				<PersonalDataForm i18nData={i18nData} />
			</VStack>
		</Card.Root>
	);
}
