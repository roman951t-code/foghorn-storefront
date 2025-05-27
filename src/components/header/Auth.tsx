'use client';
import React, { JSX } from 'react';
import { Box, Button, Stack, Icon } from '@chakra-ui/react';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import CenteredModal from '@/components/dialogs/CenteredModal';
import EmailAuth from './EmailAuth';
import { signIn, signOut, useSession } from 'next-auth/react';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
	trigger?: JSX.Element;
}

export default function Auth({ i18nData, trigger }: Props) {
	const { data: session } = useSession();

	return (
		<CenteredModal title={i18nData.authorize} trigger={trigger} size='md'>
			<Box maxW='400px' p={4} borderRadius='lg' mx='auto'>
				{!session ? (
					<>
						<EmailAuth
							onSubmitAction={({ email, password }) => {
								signIn('credentials', { email, password, redirect: false });
							}}
							i18nData={i18nData}
						/>

						<Stack gap={4} marginTop={12}>
							<Button
								gap='12px'
								variant='outline'
								borderColor='main'
								onClick={() => signIn('google')}
							>
								<Icon size='md'>
									<FcGoogle />
								</Icon>
								{i18nData.continueWith} Google
							</Button>
							<Button
								gap='12px'
								variant='outline'
								borderColor='main'
								onClick={() => signIn('facebook')}
							>
								<Icon color='blue.500' size='md'>
									<FaFacebook />
								</Icon>
								{i18nData.continueWith} Facebook
							</Button>
						</Stack>
					</>
				) : (
					<Stack>
						<Box textAlign='center'>Logged in as {session.user?.email}</Box>
						<Button onClick={() => signOut()}>{i18nData.logOut}</Button>
					</Stack>
				)}
			</Box>
		</CenteredModal>
	);
}
