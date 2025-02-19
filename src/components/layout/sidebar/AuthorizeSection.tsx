import { Card, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export function LogoutSection() {
	const authT = useTranslations('Auth');

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<Button color='main' variant='outline' border='1px solid ' borderColor='border'>
					{authT('logOut')}
				</Button>
			</Card.Body>
		</Card.Root>
	);
}

export function AuthorizeSection() {
	const sidebarT = useTranslations('Sidebar');
	const authT = useTranslations('Auth');

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
			<Card.Body gap={3}>
				<Button color='main' variant='outline' border='1px solid ' borderColor='border'>
					{authT('authorize')}
				</Button>
				<Card.Description color='main' textStyle='xs' textAlign='center'>
					{sidebarT('authorizeDetails')}
				</Card.Description>
			</Card.Body>
		</Card.Root>
	);
}
