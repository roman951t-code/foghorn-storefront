import { Input, Field, Button } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';

interface Props {
	error?: { message?: string };
	pending: boolean;
	emailForm: UseFormReturn<
		{
			email: any;
		},
		unknown,
		{
			email: string;
		}
	>;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function EmailForm({ i18nData, error, pending, emailForm, onSubmitAction }: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Field.Root
				orientation={fieldOrientation}
				invalid={!!emailForm.formState.errors.email || !!error?.message}
				gap='4'
				justifyContent='center'
			>
				<Field.Label maxH='20px'>{i18nData.email}</Field.Label>
				<Input {...emailForm.register('email')} variant='outline' size='md' maxW='xl' />
				<Field.ErrorText>
					{emailForm.formState.errors.email?.message?.toString() || error?.message}
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
