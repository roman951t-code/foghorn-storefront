import { Input, Field, VStack, Fieldset } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';

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
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function NameForm({ nameForm, i18nData, onSubmitAction }: Props) {
	const fieldOrientation = { base: 'vertical' as const, sm: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Fieldset.Root size='lg' alignItems='center'>
				<Fieldset.Content
					css={{ '--field-label-width': '120px' }}
					gap='6'
					border='1px solid'
					borderColor='border.dark'
					borderRadius='md'
					p='4'
					maxW='4xl'
				>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.name}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.name} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input {...nameForm.register('name')} variant='outline' size='md' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.name?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.lastName}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.lastName} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input {...nameForm.register('lastName')} variant='outline' size='md' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.lastName?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.middleName}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px'>
							{i18nData.middleName}
							<Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input {...nameForm.register('middleName')} variant='outline' size='md' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.middleName?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>
					<SecondaryButton alignSelf={{ base: 'stretch', sm: 'flex-end' }} type='submit' size='md'>
						{i18nData.save}
					</SecondaryButton>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
