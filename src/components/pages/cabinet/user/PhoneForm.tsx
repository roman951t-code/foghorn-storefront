import { Input, Field, Stack, Fieldset, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormMask } from 'use-mask-input';
import z from 'zod';
import { sendVerifyPhoneAction } from '@/actions/auth/sendVerifyPhoneAction';
import { PhoneSchemaData } from 'formValidationSchemas/accountSchema';
import PhoneUpdate from './PhoneUpdate';

interface Props {
	i18nData: I18nData;
	userPhone: string;
	refreshSession: () => void;
	schema: z.ZodObject<
		{
			phone: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
		},
		'strip',
		z.ZodTypeAny,
		{
			phone: string;
		},
		{
			phone: string;
		}
	>;
}

type FormValues = {
	name?: string;
	phone: string;
};

export default function PhoneForm({ i18nData, userPhone, schema, refreshSession }: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	const [isOpen, setIsOpen] = useState(false);
	const [authError, setAuthError] = useState('');
	const [isPending, setIsPending] = useState(false);

	const {
		register,
		watch,
		getValues,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		defaultValues: { phone: userPhone },
		resolver: zodResolver(schema),
	});
	const registerWithMask = useHookFormMask(register);

	const onSubmit = async (formData: PhoneSchemaData) => {
		setIsPending(true);

		try {
			const result = await sendVerifyPhoneAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message!);
			}

			setIsOpen(true);
		} catch {
			setAuthError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	const watchPhone = watch('phone');

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root
							orientation={fieldOrientation}
							justifyContent='center'
							invalid={!!errors.phone}
						>
							<Field.Label maxH='20px'>{i18nData.phone}</Field.Label>
							<Stack w='full' direction={{ base: 'column', sm: 'row' } as any} gap='4'>
								<VStack w='full' alignItems='flex-start'>
									<Input
										{...registerWithMask('phone', ['380999999999', '999999999'], {
											required: i18nData.phoneRequired,
										})}
										type='text'
										variant='outline'
										size='md'
										maxLength={17}
									/>
									<Field.ErrorText>{errors.phone?.message || authError}</Field.ErrorText>
								</VStack>
								<SecondaryButton
									type='submit'
									loading={isPending}
									mt={{ base: '2', sm: '0' }}
									onClick={() => onSubmit(getValues())}
								>
									{i18nData.save}
								</SecondaryButton>
							</Stack>
						</Field.Root>
					</Fieldset.Content>
				</Fieldset.Root>
			</form>
			<CenteredModal
				closeOnInteractOutside={false}
				title={i18nData.editPhone}
				size='sm'
				open={isOpen}
				setIsOpen={setIsOpen}
			>
				<PhoneUpdate
					i18nData={i18nData}
					phone={watchPhone}
					onCloseAction={() => setIsOpen(false)}
					refreshSession={refreshSession}
				/>
			</CenteredModal>
		</>
	);
}
