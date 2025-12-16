import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { AlertButton } from '@/components/ui/buttons/ActionButton';
import { deleteUserAction } from '@/actions/auth/deleteUserAction';
import { authClient } from '@/lib/auth-client';
import { useSession } from '@/providers/SessionProvider';
import { useState } from 'react';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useTranslations } from 'next-intl';
import { DELETE_ACCOUNT_DIALOG_IDS } from '@/constants/dialogs';

interface Props {
	onCloseAction: () => void;
}

export function DeleteAccount({ onCloseAction }: Props) {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');
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
				showToaster(
					'error',
					toasterMessages.deleteAccountFailed(result?.message, validT)
				);
			}
		} catch {
			showToaster('error', toasterMessages.deleteAccountFailed(null, validT));
		} finally {
			setPending(false);
		}
	};

	return (
		<Dialog.Root
			role='alertdialog'
			lazyMount
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			ids={DELETE_ACCOUNT_DIALOG_IDS}
		>
			<Dialog.Trigger asChild>
				<AlertButton mt='8' w='full'>
					{authT('deleteAccount')}
				</AlertButton>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg='bg.tertiary'>
						<Dialog.Header>
							<Dialog.Title>{authT('areYouSure')}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text fontSize='15px' lineHeight='1.45'>
								{authT('confirmDeleteAcc')}
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button color='main' variant='outline' border='1px solid ' borderColor='border'>
									{authT('close')}
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
								{authT('deleteAccount')}
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
