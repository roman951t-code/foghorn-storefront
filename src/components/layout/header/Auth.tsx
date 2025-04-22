'use client';
import { Box, Button, Stack, IconButton, Icon } from '@chakra-ui/react';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useTranslations } from 'next-intl';
import CenteredModal from '../../dialogs/CenteredModal';
import EmailAuth from './EmailAuth';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Auth({ trigger }: { trigger?: JSX.Element }) {
	const t = useTranslations('Auth');
	const { data: session } = useSession();
	return (
		<CenteredModal title={t('authorize')} trigger={trigger} size='md'>
			<Box maxW='400px' p={4} borderRadius='lg' mx='auto'>
				{!session ? (
					<>
						<EmailAuth
							submitText={t('continue')}
							emailLabel={t('email')}
							passLabel={t('password')}
							emailRequired={t('emailRequired')}
							passRequired={t('passRequired')}
							onSubmit={({ email, password }) => {
								signIn('credentials', { email, password, redirect: false });
							}}
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
								{t('continueWith')} Google
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
								{t('continueWith')} Facebook
							</Button>

							<Button
								gap='12px'
								variant='outline'
								borderColor='main'
								onClick={() => signIn('apple')}
							>
								<Icon size='md'>
									<FaApple />
								</Icon>
								{t('continueWith')} Apple
							</Button>
						</Stack>
					</>
				) : (
					<Stack>
						<Box textAlign='center'>Logged in as {session.user?.email}</Box>
						<Button onClick={() => signOut()}>{t('logout')}</Button>
					</Stack>
				)}
			</Box>
		</CenteredModal>
	);
}
