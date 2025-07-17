import { Input, Field, Button, VStack, Fieldset } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';

interface Props {
	nameForm: UseFormReturn<
		{
			name: any;
			lastName: any;
			middleName: any;
		},
		unknown,
		{
			name: string;
			lastName: any;
			middleName: any;
		}
	>;
	error?: { message?: string };
	pending: boolean;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function NameForm({ nameForm, i18nData, error, pending, onSubmitAction }: Props) {
	const fieldOrientation = { base: 'vertical' as const, sm: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Fieldset.Root size='lg' alignItems='center'>
				<Fieldset.Content
					gap='6'
					border='1px solid'
					borderColor='border.dark'
					borderRadius='md'
					p='4'
					maxW='4xl'
				>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.name || !!error?.message}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.name} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='2xl'>
							<Input {...nameForm.register('name')} variant='outline' size='md' maxW='2xl' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.name?.message?.toString() || error?.message}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.lastName || !!error?.message}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.lastName} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='2xl'>
							<Input {...nameForm.register('lastName')} variant='outline' size='md' maxW='2xl' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.lastName?.message?.toString() || error?.message}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.middleName || !!error?.message}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.middleName}
							<Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='2xl'>
							<Input {...nameForm.register('middleName')} variant='outline' size='md' maxW='2xl' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.middleName?.message?.toString() || error?.message}
							</Field.ErrorText>
						</VStack>
					</Field.Root>
					<Button
						alignSelf={{ base: 'stretch', sm: 'flex-end' }}
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
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
