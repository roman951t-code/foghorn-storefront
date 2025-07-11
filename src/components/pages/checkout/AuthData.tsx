'use client';
import { Button, Flex, Heading, Card, VStack } from '@chakra-ui/react';
import Auth from '@/components/auth/Auth';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { FiUserCheck } from 'react-icons/fi';
import { I18nData } from '@/types/i18n';
import { useSession } from '@/components/providers/SessionProvider';

export default function AuthData({ i18nData }: { i18nData: I18nData }) {
	const { session } = useSession();

	return session.session ? (
		<VStack w='100%' mt='8' gap='4' direction='column'>
			<Heading as='h4' size='md' w='100%' textAlign='left'>
				{i18nData.yourContacts}
			</Heading>
			<PersonalDataForm i18nData={i18nData} />
		</VStack>
	) : (
		<Card.Header p='0'>
			<Flex
				gap='4'
				flexWrap='wrap'
				alignItems='center'
				justifyContent={{ base: 'center', sm: 'space-between' }}
			>
				<Heading as='h4' size='md'>
					{i18nData.authToOrder}
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
							{i18nData.authorize}
						</Button>
					}
				/>
			</Flex>
		</Card.Header>
	);
}
