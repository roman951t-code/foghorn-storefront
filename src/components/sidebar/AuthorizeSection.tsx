import { authClient } from '@/lib/auth-client';
import { Card, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useSession } from '../providers/SessionProvider';
import { I18nData } from '@/types/i18n';

interface LogoutProps {
	onClose: () => void;
}

export function LogoutSection({ onClose }: LogoutProps) {
	const authT = useTranslations('Auth');
	const { refresh } = useSession();

	const handleLogogut = async () => {
		await authClient.signOut();
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
		onClose();
	};

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<Button
					color='main'
					variant='outline'
					border='1px solid '
					borderColor='border'
					onClick={handleLogogut}
				>
					{authT('logOut')}
				</Button>
			</Card.Body>
		</Card.Root>
	);
}

interface Props {
	i18nData: I18nData;
	authOpen: boolean;
	onAuthOpen: () => void;
}

export function AuthorizeSection({ i18nData, onAuthOpen }: Props) {
	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<Button
					color='main'
					variant='outline'
					border='1px solid '
					borderColor='border'
					onClick={onAuthOpen}
				>
					{i18nData.authorize}
				</Button>
				<Card.Description color='main' textStyle='xs' textAlign='center'>
					{i18nData.authorizeDetails}
				</Card.Description>
			</Card.Body>
		</Card.Root>
	);
}
