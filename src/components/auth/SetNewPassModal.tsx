'use client';

import { Button, Fieldset, Stack, Field, Box, Alert } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { startTransition, useActionState, useEffect, useState } from 'react';
import type { I18nData } from '@/types/i18n';
import { PasswordInput } from '../ui/password-input';
import CenteredModal from '../dialogs/CenteredModal';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toaster } from '../ui/toaster';
import { setNewPasswordAction } from '@/actions/setNewPasswordAction';
import { useRouter } from 'next/navigation';

interface ResetPassProps {
	i18nData: I18nData;
}

type FormValues = {
	password: string;
};

const MAX_CHARACTERS = 60;

export default function SetNewPassModal({ i18nData }: ResetPassProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	const resetPass = searchParams?.get('reset-pass') === 'true';

	const [formError, formAction, isPending] = useActionState(setNewPasswordAction, undefined);
	const [isOpen, setIsOpen] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [isPassUpdated, setPassUpdated] = useState(false);

	useEffect(() => {
		const token = new URLSearchParams(window.location.search).get('token');

		if (session || !resetPass) return;

		if (!token) {
			setTimeout(() => {
				toaster.error({
					title: i18nData.refreshTokenError,
					duration: 5000,
				});
			}, 0);

			return;
		}

		setToken(token);
		setIsOpen(true);
	}, [resetPass, session]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const handleClose = () => {
		setToken(null);
		setIsOpen(false);
		const current = new URLSearchParams(window.location.search);
		current.delete('reset-pass');
		current.delete('token');
		current.delete('callbackURL');
		const newSearch = current.toString();
		const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
		router.replace(newPath);
	};

	if (!isOpen || !token) return null;

	return (
		<CenteredModal
			closeOnInteractOutside={false}
			title={i18nData.renewPass}
			trigger={null}
			size='md'
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Box maxW='400px' mx='auto' my='auto'>
				<form
					onSubmit={handleSubmit(async (formData) => {
						if (!token) return;

						startTransition(() => {
							formAction({ formData, token });

							setPassUpdated(true);
						});
					})}
				>
					<Stack gap='4' align='flex-start'>
						<Fieldset.Root size='lg' invalid>
							<Fieldset.Content>
								<Field.Root required invalid={!!errors.password}>
									<Field.Label>
										{i18nData.password}
										<Field.RequiredIndicator />
									</Field.Label>
									<PasswordInput
										fontSize='md'
										{...register('password')}
										maxLength={MAX_CHARACTERS}
									/>
									<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
								</Field.Root>

								<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>
							</Fieldset.Content>
							{isPassUpdated && !isSubmitting && !isPending && (
								<>
									<Alert.Root status='success' variant='solid' my='2' fontSize='15px'>
										<Alert.Indicator />
										<Alert.Title>{i18nData.passUpdated}</Alert.Title>
									</Alert.Root>

									<Button
										onClick={handleClose}
										w='100%'
										mt='4'
										type='submit'
										loading={isSubmitting || isPending}
										borderColor='border'
										variant='outline'
									>
										{i18nData.close}
									</Button>
								</>
							)}

							{!isPassUpdated && (
								<Button
									w='100%'
									mt='4'
									type='submit'
									loading={isSubmitting || isPending}
									bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
									color='black'
									variant='solid'
								>
									{i18nData.saveNewPass}
								</Button>
							)}
						</Fieldset.Root>
					</Stack>
				</form>
			</Box>
		</CenteredModal>
	);
}
