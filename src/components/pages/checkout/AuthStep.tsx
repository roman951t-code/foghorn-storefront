import { Button, Flex, Heading, Card, VStack } from '@chakra-ui/react';
import Auth from '@/components/auth/Auth';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { extractI18nData } from '@/utils/i18nUtils';
import { FiUserCheck } from 'react-icons/fi';
import { authLocData, validLocData } from '@/data/localized';

export default function AuthStep() {
	const authT = useTranslations('Auth');
	const validT = useTranslations('Validation');

	const authI18nData = extractI18nData(authT, authLocData);
	const validI18nData = extractI18nData(validT, validLocData);

	const i18nData = {
		...authI18nData,
		...validI18nData,
	};

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' p='4'>
			<Card.Header p='0'>
				<Flex
					gap='4'
					flexWrap='wrap'
					alignItems='center'
					justifyContent={{ base: 'center', sm: 'space-between' }}
				>
					<Heading as='h4' size='md'>
						{authT('authToOrder')}
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
								{authT('authorize')}
							</Button>
						}
					/>
				</Flex>
			</Card.Header>

			<VStack w='100%' mt='8' gap='4' direction='column'>
				<Heading as='h4' size='md' w='100%' textAlign='left'>
					{authT('yourContacts')}
				</Heading>
				<PersonalDataForm i18nData={i18nData} />
			</VStack>
		</Card.Root>
	);
}
