import { authClient } from '@/lib/auth-client';
import { Card } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useSession } from '@/providers/SessionProvider';
import { useRouter } from '@/i18n/routing';
import { TertiaryButton } from '@/components/ui/buttons/ActionButton';

interface LogoutProps {
	onClose: () => void;
}

export function LogoutSection({ onClose }: LogoutProps) {
	const authT = useTranslations('auth');
	const { refresh } = useSession();
	const router = useRouter();

	const handleLogout = async () => {
		await authClient.signOut();
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
		onClose();

		router.replace('/');
	};

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border'>
			<Card.Body gap={3}>
				<TertiaryButton onClick={handleLogout}>{authT('logOut')}</TertiaryButton>
			</Card.Body>
		</Card.Root>
	);
}

interface Props {
	onAuthOpen: () => void;
}

export function AuthorizeSection({ onAuthOpen }: Props) {
	const navT = useTranslations('navigation');
	const authT = useTranslations('auth');

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border'>
			<Card.Body gap={3}>
				<TertiaryButton onClick={onAuthOpen}>{authT('authorize')}</TertiaryButton>

				<Card.Description color='main' fontSize={{ base: 'md', md: 'xs' }} textAlign='center'>
					{navT('sidebar.authorizeDetails')}
				</Card.Description>
			</Card.Body>
		</Card.Root>
	);
}
