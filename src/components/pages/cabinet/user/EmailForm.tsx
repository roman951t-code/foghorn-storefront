import { Input, Field, VStack, Fieldset, Highlight, Text, Stack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { UseFormReturn } from 'react-hook-form';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';

interface TriggerProps {
	text: string;
	pending: boolean;
}

const Trigger = ({ text, pending }: TriggerProps) => (
	<SecondaryButton type='submit' loading={pending} mt={{ base: '2', sm: '0' }}>
		{text}
	</SecondaryButton>
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
				justifyContent='center'
			>
				<Field.Label maxH='20px'>{i18nData.email}</Field.Label>

				<Stack w='full' direction={{ base: 'column', sm: 'row' } as any} gap='4'>
					<VStack w='full' alignItems='flex-start'>
						<Input {...emailForm.register('email')} variant='outline' size='md' />
						<Field.ErrorText>
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
				</Stack>
			</Field.Root>
		</form>
	);
}
