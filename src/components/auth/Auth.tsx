'use client';
import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { signIn, signOut, useSession } from 'next-auth/react';
import type { I18nData } from '@/types/i18n';
import Login from './Login';
import Signup from './Signup';

interface Props {
	i18nData: I18nData;
	trigger?: React.JSX.Element;
}

export default function Auth({ i18nData, trigger }: Props) {
	const { data: session, status } = useSession();
	const [showSignup, setShowSignup] = useState(false);
	console.log('status', status);
	const toggleSignup = () => {
		setShowSignup((prevState) => !prevState);
	};

	return (
		<CenteredModal
			closeOnInteractOutside={false}
			title={showSignup ? i18nData.register : i18nData.authorize}
			trigger={trigger}
			size='md'
		>
			<Box maxW='400px' mx='auto' my='auto'>
				{!session && (
					<>
						{showSignup ? (
							<Signup i18nData={i18nData} backToLogin={toggleSignup} />
						) : (
							<Login i18nData={i18nData} moveToSignup={toggleSignup} />
						)}
					</>
				)}

				{session && (
					<>
						<Box textAlign='center'>Logged in as {session?.user?.email}</Box>
						<Button onClick={() => signOut()}>{i18nData.logOut}</Button>
					</>
				)}
			</Box>
		</CenteredModal>
	);
}
