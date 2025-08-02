import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { I18nData } from '@/types/i18n';
import { AlertButton } from '../reusable/buttons/ActionButton';
import { deleteUserAction } from '@/actions/auth/deleteUserAction';
import { authClient } from '@/lib/auth-client';
import { useSession } from '../providers/SessionProvider';
import { useState } from 'react';
import { toaster } from '../reusable/chakra/toaster';

interface Props {
	onCloseAction: () => void;
	i18nData: I18nData;
}

export function DeleteAccount({ i18nData, onCloseAction }: Props) {
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const { refresh } = useSession();

	const handleDeleteUser = async () => {
		setPending(true);
		try {
			const result = await deleteUserAction();

			if (result?.success) {
				await authClient.signOut();
				await refresh();

				const bc = new BroadcastChannel('auth');
				bc.postMessage('session-updated');
				bc.close();
				setOpen(false);

				onCloseAction();
			} else {
				toaster.error({
					title: result?.message,
					duration: 5000,
				});
			}
		} catch {
			toaster.error({
				title: i18nData?.deleteFailed,
				duration: 5000,
			});
		} finally {
			setPending(false);
		}
	};

	return (
		<Dialog.Root role='alertdialog' lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
			<Dialog.Trigger asChild>
				<AlertButton mt='8' w='full'>
					{i18nData.deleteAccount}
				</AlertButton>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg='bg.tertiary'>
						<Dialog.Header>
							<Dialog.Title>{i18nData.areYouSure}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text fontSize='15px' lineHeight='1.45'>
								{i18nData.confirmDeleteAcc}
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button color='main' variant='outline' border='1px solid ' borderColor='border'>
									{i18nData.close}
								</Button>
							</Dialog.ActionTrigger>
							<Button
								onClick={handleDeleteUser}
								loading={pending}
								colorPalette='red'
								variant={{
									base: 'surface',
									_dark: 'solid',
								}}
							>
								{i18nData.deleteAccount}
							</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger
							asChild
							color='main'
							_hover={{
								bg: 'transparent',
								border: '1px solid',
								borderColor: 'main',
							}}
						>
							<CloseButton size='sm' />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
