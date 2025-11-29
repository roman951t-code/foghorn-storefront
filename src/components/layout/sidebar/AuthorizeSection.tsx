import { authClient } from '@/lib/auth-client';
import { Card } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useSession } from '@/providers/SessionProvider';
import { redirect } from 'next/navigation';
import { TertiaryButton } from '@/components/ui/buttons/ActionButton';

interface LogoutProps {
	onClose: () => void;
}

export function LogoutSection({ onClose }: LogoutProps) {
	const authT = useTranslations('auth');
	const { refresh } = useSession();

	const handleLogogut = async () => {
		await authClient.signOut();
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
		onClose();

		redirect('/');
	};

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<TertiaryButton onClick={handleLogogut}>{authT('logOut')}</TertiaryButton>
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
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<TertiaryButton onClick={onAuthOpen}>{authT('authorize')}</TertiaryButton>

				<Card.Description color='main' textStyle='xs' textAlign='center'>
					{navT('sidebar.authorizeDetails')}
				</Card.Description>
			</Card.Body>
		</Card.Root>
	);
}
