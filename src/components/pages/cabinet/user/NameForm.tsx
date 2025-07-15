import { Input, Field, Button } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';

interface Props {
	nameForm: UseFormReturn<
		{
			name: any;
		},
		unknown,
		{
			name: string;
		}
	>;
	error?: { message?: string };
	pending: boolean;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function NameForm({ nameForm, i18nData, error, pending, onSubmitAction }: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Field.Root
				orientation={fieldOrientation}
				invalid={!!nameForm.formState.errors.name || !!error?.message}
				gap='4'
				justifyContent='center'
			>
				<Field.Label maxH='20px'>{i18nData.name}</Field.Label>
				<Input {...nameForm.register('name')} variant='outline' size='md' maxW='xl' />
				<Field.ErrorText>
					{nameForm.formState.errors.name?.message?.toString() || error?.message}
				</Field.ErrorText>
				<Button
					type='submit'
					loading={pending}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					variant='solid'
					size='md'
					rounded='md'
				>
					{i18nData.save}
				</Button>
			</Field.Root>
		</form>
	);
}
