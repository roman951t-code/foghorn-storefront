import { Input, Field, VStack, Fieldset } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { useId } from 'react';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { FIELD_ORIENTATION_SM } from '@/constants/forms';

interface Props {
	nameForm: UseFormReturn<
		{
			name: string;
			lastName: string;
			middleName: string;
		},
		unknown,
		{
			name: string;
			lastName: string;
			middleName: string;
		}
	>;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function NameForm({ nameForm, i18nData, onSubmitAction }: Props) {
	const nameId = useId();
	const lastNameId = useId();
	const middleNameId = useId();

	return (
		<form onSubmit={onSubmitAction}>
			<Fieldset.Root size='lg' alignItems='stretch' w='full'>
				<Fieldset.Content
					css={{ '--field-label-width': '120px' }}
					bg='bg.tertiary'
					gap='6'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p={{ base: 4, md: 6 }}
					w='full'
				>
					<Field.Root
						orientation={FIELD_ORIENTATION_SM}
						invalid={!!nameForm.formState.errors.name}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px' htmlFor={nameId}>
							{i18nData.name} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input id={nameId} {...nameForm.register('name')} size='md' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.name?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={FIELD_ORIENTATION_SM}
						invalid={!!nameForm.formState.errors.lastName}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px' htmlFor={lastNameId}>
							{i18nData.lastName} <Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input id={lastNameId} {...nameForm.register('lastName')} size='md' />
							<Field.ErrorText alignSelf='flex-start'>
								{nameForm.formState.errors.lastName?.message?.toString()}
							</Field.ErrorText>
						</VStack>
					</Field.Root>

					<Field.Root
						orientation={FIELD_ORIENTATION_SM}
						invalid={!!nameForm.formState.errors.middleName}
						gap='4'
						justifyContent='center'
						required
					>
						<Field.Label maxH='20px' htmlFor={middleNameId}>
							{i18nData.middleName}
							<Field.RequiredIndicator />
						</Field.Label>

						<VStack w='full' maxW='3xl'>
							<Input id={middleNameId} {...nameForm.register('middleName')} size='md' />
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
