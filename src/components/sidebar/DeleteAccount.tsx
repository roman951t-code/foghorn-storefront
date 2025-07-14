import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { I18nData } from '@/types/i18n';

export function DeleteAccount({ i18nData }: { i18nData: I18nData }) {
	return (
		<Dialog.Root role='alertdialog'>
			<Dialog.Trigger asChild>
				<Button
					colorPalette='red'
					variant={{
						base: 'subtle',
						_dark: 'solid',
					}}
					w='auto'
					m='4'
					rounded='sm'
				>
					{i18nData.deleteAccount}
				</Button>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
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
								<Button variant='outline'>{i18nData.close}</Button>
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
						<Dialog.CloseTrigger asChild>
							<CloseButton size='sm' />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
