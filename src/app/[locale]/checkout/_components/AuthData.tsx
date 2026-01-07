'use client';

import { Flex, Heading, Card } from '@chakra-ui/react';
import { FiUserCheck } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { I18nData } from '@/types/i18n';
import { useSession } from '@/providers/SessionProvider';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { LoadingSkeleton } from '@/components/ui/Skeleton';

function AuthStepSkeleton() {
	return (
		<Flex justifyContent='center' alignItems='center' w='full'>
			<LoadingSkeleton />
		</Flex>
	);
}

const PersonalDataForm = dynamic(() => import('../../cabinet/_components/user/PersonalDataForm'), {
	loading: () => <AuthStepSkeleton />,
	ssr: false,
});

const Auth = dynamic(() => import('@/features/auth/Auth'), {
	loading: () => <AuthStepSkeleton />,
	ssr: false,
});

export default function AuthData({ i18nData }: { i18nData: I18nData }) {
	const { session } = useSession();

	if (!session) {
		return <AuthStepSkeleton />;
	}

	return session?.session ? (
		<PersonalDataForm i18nData={i18nData} />
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
