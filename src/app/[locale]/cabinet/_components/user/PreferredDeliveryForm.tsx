'use client';

import { Box, Field, Fieldset, Icon, RadioCard, Stack } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import type { I18nData } from '@/types/i18n';
import { setNotificationMethodAction } from '@/actions/auth/setNotificationMethodAction';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { FIELD_ORIENTATION_MD } from '@/constants/forms';
import { useEffect, useMemo } from 'react';

interface Props {
	userEmail?: string | null;
	userPhone?: string | null;
	userNotifMethod?: string | null;
	refreshSessionAction: () => Promise<void>;
	i18nData: I18nData;
}

interface NotificationFormValues {
	notificationMethod: 'email' | 'phone' | '';
}

export default function PreferredDeliveryForm({
	userEmail,
	userPhone,
	i18nData,
	userNotifMethod,
	refreshSessionAction,
}: Props) {
	const hasEmail = Boolean(userEmail?.trim());
	const hasPhone = Boolean(userPhone?.trim());

	const resolvedInitialMethod = useMemo<NotificationFormValues['notificationMethod']>(() => {
		if (userNotifMethod === 'email' && hasEmail) return 'email';
		if (userNotifMethod === 'phone' && hasPhone) return 'phone';
		if (hasEmail) return 'email';
		if (hasPhone) return 'phone';
		return '';
	}, [hasEmail, hasPhone, userNotifMethod]);

	const form = useForm<NotificationFormValues>({
		defaultValues: {
			notificationMethod: resolvedInitialMethod,
		},
	});

	useEffect(() => {
		form.reset({ notificationMethod: resolvedInitialMethod });
	}, [form, resolvedInitialMethod]);

	const onSubmit = async (data: NotificationFormValues) => {
		if (!data.notificationMethod) {
			showToaster('error', toasterMessages.notificationUpdateFailed(i18nData));
			return;
		}

		try {
			const result = await setNotificationMethodAction(null, {
				notificationMethod: data.notificationMethod,
			});

			if (result?.success) {
				showToaster('success', toasterMessages.notificationUpdated(i18nData));
				await refreshSessionAction();
			} else {
				showToaster('error', toasterMessages.notificationUpdateFailed(i18nData));
			}
		} catch {
			showToaster('error', toasterMessages.notificationUpdateFailed(i18nData));
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset.Root size='lg' alignItems='stretch'>
				<Fieldset.Content
					bg='main'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p='4'
				>
					<Field.Root
						orientation={FIELD_ORIENTATION_MD}
						invalid={!!form.formState.errors.notificationMethod}
						gap='4'
						justifyContent='stretch'
					>
						<Controller
							name='notificationMethod'
							control={form.control}
							rules={{ required: i18nData.invalidFormData }}
							render={({ field }) => (
								<RadioCard.Root
									w='full'
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									orientation='horizontal'
									value={field.value}
									onChange={(event) => {
										const value = (event.target as HTMLInputElement).value;
										field.onChange(value);
									}}
									css={{
										'& div[data-state="unchecked"] span': {
											borderColor: 'var(--chakra-colors-fg) !important',
										},
									}}
								>
									<RadioCard.Label fontSize='md' mb='4' fontWeight='medium'>
										{i18nData.preferredNotificationWay}
									</RadioCard.Label>
									<Stack direction={{ base: 'column', sm: 'row' }} gap='4'>
										<RadioCard.Item
											disabled={!hasEmail}
											value='email'
											boxShadow='none'
											borderWidth='0.5px'
											_hover={{ cursor: 'pointer' }}
											w='full'
											borderColor={{ base: 'initial', _disabled: 'border' }}
											bg={{ base: 'main', _disabled: 'bg.dark' }}
											justifyContent={{ base: 'initial', sm: 'center' }}
											css={{
												'&[data-state="checked"]': {
													borderWidth: '0.5px',
												},
												'&[data-disabled], &[aria-disabled="true"]': {
													borderWidth: '0.5px',
												},
											}}
										>
											<RadioCard.ItemHiddenInput />
											<RadioCard.ItemControl alignItems='center'>
												<Icon fontSize='2xl' color='fg.muted'>
													<IoMailOutline />
												</Icon>
												<RadioCard.ItemText>{i18nData.email}</RadioCard.ItemText>
												<RadioCard.ItemIndicator />
											</RadioCard.ItemControl>
										</RadioCard.Item>

										<RadioCard.Item
											disabled={!hasPhone}
											value='phone'
											boxShadow='none'
											borderWidth='0.5px'
											_hover={{ cursor: 'pointer' }}
											w='full'
											bg={{ base: 'main', _disabled: 'bg.dark' }}
											justifyContent={{ base: 'initial', sm: 'center' }}
											css={{
												'&[data-state="checked"]': {
													borderWidth: '0.5px',
												},
												'&[data-disabled], &[aria-disabled="true"]': {
													borderWidth: '0.5px',
												},
											}}
										>
											<RadioCard.ItemHiddenInput />
											<RadioCard.ItemControl alignItems='center'>
												<Icon fontSize='2xl' color='fg.muted'>
													<IoMdPhonePortrait />
												</Icon>
												<RadioCard.ItemText>{i18nData.phone}</RadioCard.ItemText>
												<RadioCard.ItemIndicator />
											</RadioCard.ItemControl>
										</RadioCard.Item>
									</Stack>
								</RadioCard.Root>
							)}
						/>
						<Field.ErrorText mt='2'>
							{form.formState.errors.notificationMethod?.message?.toString()}
						</Field.ErrorText>
					</Field.Root>
					<Box display='flex' justifyContent={{ base: 'stretch', sm: 'flex-end' }} mt='4'>
						<SecondaryButton
							type='submit'
							loading={form.formState.isSubmitting}
							disabled={
								form.formState.isSubmitting ||
								!form.watch('notificationMethod') ||
								(!hasEmail && !hasPhone)
							}
							size='md'
							w={{ base: 'full', sm: 'auto' }}
						>
							{i18nData.save}
						</SecondaryButton>
					</Box>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
