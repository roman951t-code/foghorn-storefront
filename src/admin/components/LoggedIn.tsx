import { useTranslation } from 'adminjs';
import { Box, CurrentUserNav } from '@adminjs/design-system';

type LoggedInProps = {
	session: {
		email?: string;
		title?: string;
		avatarUrl?: string;
	};
	paths: {
		logoutPath: string;
	};
};

export default function LoggedIn({ session, paths }: LoggedInProps) {
	const { translateButton } = useTranslation();

	const dropActions = [
		{
			label: translateButton('logout'),
			onClick: (event: Event) => {
				event.preventDefault();
				window.location.href = paths.logoutPath;
			},
			icon: 'LogOut',
		},
	];

	return (
		<Box flexShrink={0} data-css='logged-in'>
			<CurrentUserNav
				name={session.email}
				title={session.title}
				avatarUrl={session.avatarUrl}
				dropActions={dropActions}
			/>
		</Box>
	);
}
