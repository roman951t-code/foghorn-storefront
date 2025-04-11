import { Button, Flex, Heading, Card, VStack } from '@chakra-ui/react';
import Auth from '@/components/layout/header/Auth';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';

export default function AuthStep() {
	const authT = useTranslations('Auth');

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
						{authT('authToOrder')}
					</Heading>
					<Auth
						trigger={
							<Button
								w='220px'
								type='submit'
								bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
								color='black'
								variant='solid'
							>
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
				<PersonalDataForm />
			</VStack>
		</Card.Root>
	);
}
