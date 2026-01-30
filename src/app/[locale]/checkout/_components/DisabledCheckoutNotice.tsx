'use client';
import { Alert } from '@chakra-ui/react';

export default function DisabledCheckoutNotice({
	title,
	description,
}: {
	title: string | null;
	description: string | null;
}) {
	if (!title && !description) return null;

	return (
		<Alert.Root
			mt='2'
			fontSize='15px'
			lineHeight='1.45'
			status='warning'
			variant='outline'
			color='main'
			colorPalette='gray'
			borderRadius='md'
			borderWidth='0.5px'
		>
			<Alert.Indicator />
			<Alert.Content>
				{title && <Alert.Title>{title}</Alert.Title>}
				{description && <Alert.Description>{description}</Alert.Description>}
			</Alert.Content>
		</Alert.Root>
	);
}
