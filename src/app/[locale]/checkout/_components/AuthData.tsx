'use client';

import { Flex, Heading, Card, VStack, Spinner } from '@chakra-ui/react';
import { FiUserCheck } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { I18nData } from '@/types/i18n';
import { useSession } from '@/components/providers/SessionProvider';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';

const PersonalDataForm = dynamic(() => import('../../cabinet/_components/user/PersonalDataForm'), {
	loading: () => <Spinner size='sm' />,
	ssr: false,
});

const Auth = dynamic(() => import('@/components/auth/Auth'), {
	loading: () => <Spinner size='sm' />,
	ssr: false,
});

export default function AuthData({ i18nData }: { i18nData: I18nData }) {
	const { session } = useSession();

	if (session === undefined) {
		return (
			<Flex justifyContent='center' alignItems='center' w='100%'>
				<Spinner size='md' />
			</Flex>
		);
	}

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
