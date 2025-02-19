import { FiUser } from 'react-icons/fi';
import { Box, Button, Stack, IconButton, Icon } from '@chakra-ui/react';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useTranslations } from 'next-intl';
import CenteredModal from '../../dialogs/CenteredModal';
import EmailAuth from './EmailAuth';

const AuthBtn = () => (
	<IconButton
		aria-label='Account'
		size='md'
		variant='ghost'
		color='main.lightOnly'
		rounded='full'
		colorPalette='blue'
		bg={{ _hover: 'colorPalette.400' }}
	>
		<FiUser />
	</IconButton>
);

export default function Auth({ trigger }: { trigger?: JSX.Element }) {
	const t = useTranslations('Auth');

	return (
		<CenteredModal title={t('authorize')} trigger={trigger || <AuthBtn />} size='md'>
			<Box maxW='400px' p={4} borderRadius='lg' mx='auto'>
				<EmailAuth
					submitText={t('continue')}
					emailLabel={t('email')}
					passLabel={t('password')}
					emailRequired={t('emailRequired')}
					passRequired={t('passRequired')}
				/>
				<Stack gap={4} marginTop={12}>
					<Button gap='12px' variant='outline' borderColor='main'>
						<Icon size='md'>
							<FcGoogle />
						</Icon>
						{t('continueWith')} Google
					</Button>

					<Button gap='12px' variant='outline' borderColor='main'>
						<Icon color='blue.500' size='md'>
							<FaFacebook />
						</Icon>{' '}
						{t('continueWith')} Facebook
					</Button>

					<Button gap='12px' variant='outline' borderColor='main'>
						<Icon size='md'>
							<FaApple />
						</Icon>
						{t('continueWith')} Apple
					</Button>
				</Stack>
			</Box>
		</CenteredModal>
	);
}
