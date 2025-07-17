import { Input, Field, Button, VStack, Fieldset, Highlight, Text } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';
import CenteredModal from '@/components/dialogs/CenteredModal';

interface TriggerProps {
	text: string;
	pending: boolean;
}

const Trigger = ({ text, pending }: TriggerProps) => (
	<Button
		type='submit'
		color='black'
		bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
		variant='solid'
		size='md'
		rounded='md'
		w={{ base: 'full', sm: 'auto' }}
		mt={{ base: '2', sm: '0' }}
		loading={pending}
	>
		{text}
	</Button>
);

interface Props {
	error?: { message?: string };
	pending: boolean;
	userEmail: string;
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
	isOpen: boolean;
	setIsOpenAction: (val: boolean) => void;
}

export default function EmailForm({
	i18nData,
	error,
	isOpen,
	setIsOpenAction,
	pending,
	userEmail,
	emailForm,
	onSubmitAction,
}: Props) {
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
				<VStack w='full' maxW='xl'>
					<Input {...emailForm.register('email')} variant='outline' size='md' maxW='xl' />
					<Field.ErrorText alignSelf='flex-start'>
						{emailForm.formState.errors.email?.message?.toString() || error?.message}
					</Field.ErrorText>
				</VStack>

				<CenteredModal
					closeOnInteractOutside={false}
					title={i18nData.editEmail}
					trigger={<Trigger text={i18nData.save} pending={pending} />}
					size='md'
					open={isOpen}
					setIsOpen={setIsOpenAction}
				>
					<Fieldset.Root size='lg' invalid>
						<Fieldset.Content>
							<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
								{i18nData.toPost}
								<Highlight query={userEmail} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
									{userEmail}
								</Highlight>
								<Text color='fg.muted'>{i18nData.editEmailCodeSent}</Text>
							</Fieldset.HelperText>
						</Fieldset.Content>
					</Fieldset.Root>
				</CenteredModal>
			</Field.Root>
		</form>
	);
}
