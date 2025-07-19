'use client';
import { Flex, Heading, Card, VStack } from '@chakra-ui/react';
import Auth from '@/components/auth/Auth';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';
import { FiUserCheck } from 'react-icons/fi';
import { I18nData } from '@/types/i18n';
import { useSession } from '@/components/providers/SessionProvider';
import { PrimaryButton } from '@/components/reusable/buttons/ActionButton';

export default function AuthData({ i18nData }: { i18nData: I18nData }) {
	const { session } = useSession();

	return session?.session ? (
		<VStack w='100%' gap='4' direction='column'>
			<Heading as='h4' size='md' w='100%' textAlign='center'>
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
						<PrimaryButton w='220px' type='submit'>
							<FiUserCheck />
							{i18nData.authorize}
						</PrimaryButton>
					}
				/>
			</Flex>
		</Card.Header>
	);
}
