import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { I18nData } from '@/types/i18n';
import { AlertButton } from '../reusable/buttons/ActionButton';

export function DeleteAccount({ i18nData }: { i18nData: I18nData }) {
	return (
		<Dialog.Root role='alertdialog'>
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
