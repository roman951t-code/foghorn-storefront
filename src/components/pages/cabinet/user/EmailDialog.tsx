'use client';
import React, { useState } from 'react';
import { Button, Fieldset, Text, Highlight } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import type { I18nData } from '@/types/i18n';

interface TriggerProps {
	text: string;
	onClick: () => void;
}

const Trigger = ({ text, onClick }: TriggerProps) => (
	<Button
		type='submit'
		color='main'
		colorPalette='gray'
		variant='outline'
		border='1px solid '
		borderColor='border'
		size='md'
		rounded='md'
		onClick={onClick}
	>
		{text}
	</Button>
);

interface Props {
	i18nData: I18nData;
	trigger?: React.JSX.Element;
}

export default function EmailDialog({ i18nData }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<CenteredModal
			closeOnInteractOutside={false}
			title={i18nData.editEmail}
			trigger={<Trigger text={i18nData.save} onClick={() => setIsOpen(true)} />}
			size='md'
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Content>
					<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
						{i18nData.toPost}
						<Highlight query={'roman951t@gmail.com'} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
							{'roman951t@gmail.com'}
						</Highlight>
						<Text color='fg.muted'>{i18nData.editEmailCodeSent}</Text>
					</Fieldset.HelperText>
				</Fieldset.Content>
			</Fieldset.Root>
		</CenteredModal>
	);
}
