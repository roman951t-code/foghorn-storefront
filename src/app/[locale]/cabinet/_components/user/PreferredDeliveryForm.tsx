'use client';

import { Field, RadioCard, Stack, Icon, Fieldset } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import type { I18nData } from '@/types/i18n';
import { setNotificationMethodAction } from '@/actions/auth/setNotificationMethodAction';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { FIELD_ORIENTATION_MD } from '@/constants/forms';

interface Props {
	userEmail: string;
	userPhone: string;
	userNotifMethod: 'email' | 'phone';
	refreshSessionAction: () => void;
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
	const form = useForm<NotificationFormValues>({
		defaultValues: {
			notificationMethod: userNotifMethod,
		},
	});

	const onSubmit = async (data: NotificationFormValues) => {
		try {
			const result = await setNotificationMethodAction(null, {
				notificationMethod: data.notificationMethod as 'email' | 'phone',
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
			<Fieldset.Root size='lg' alignItems='center'>
				<Fieldset.Content
					border='1px solid'
					borderColor='border.dark'
					borderRadius='md'
					p='4'
					maxW='4xl'
				>
					<Field.Root
						orientation={FIELD_ORIENTATION_MD}
						invalid={!!form.formState.errors.notificationMethod}
						gap='4'
						justifyContent='center'
					>
						<Controller
							name='notificationMethod'
							control={form.control}
							rules={{ required: i18nData.preferredNotificationRequired }}
							render={({ field }) => (
								<RadioCard.Root
									w='100%'
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									orientation='horizontal'
									value={field.value}
									onChange={field.onChange}
									css={{
										'& div[data-state="unchecked"] span': {
											borderColor: 'var(--chakra-colors-fg) !important',
										},
									}}
								>
									<RadioCard.Label fontSize='md' mb='4' fontWeight='normal' mx='auto'>
										{i18nData.preferredNotificationWay}
									</RadioCard.Label>
									<Stack direction={{ base: 'column', sm: 'row' }} gap='4' justifyContent='center'>
										<RadioCard.Item
											disabled={!userEmail}
											value='email'
											boxShadow='none'
											_hover={{ cursor: 'pointer' }}
											w='full'
											borderColor={{ base: 'initial', _disabled: 'border.disabled' }}
											bg={{ base: 'main', _disabled: 'bg.dark' }}
											justifyContent={{ base: 'initial', sm: 'center' }}
										>
											<RadioCard.ItemHiddenInput />
											<RadioCard.ItemControl alignItems='center'>
												<Icon fontSize='2xl' color='fg.muted'>
													<IoMailOutline />
												</Icon>
												<RadioCard.ItemText>Email</RadioCard.ItemText>
												<RadioCard.ItemIndicator />
											</RadioCard.ItemControl>
										</RadioCard.Item>

										<RadioCard.Item
											disabled={!userPhone}
											value='phone'
											boxShadow='none'
											_hover={{ cursor: 'pointer' }}
											w='full'
											bg='main'
											justifyContent={{ base: 'initial', sm: 'center' }}
										>
											<RadioCard.ItemHiddenInput />
											<RadioCard.ItemControl alignItems='center'>
												<Icon fontSize='2xl' color='fg.muted'>
													<IoMdPhonePortrait />
												</Icon>
												<RadioCard.ItemText>Телефон</RadioCard.ItemText>
												<RadioCard.ItemIndicator />
											</RadioCard.ItemControl>
										</RadioCard.Item>

										<SecondaryButton
											type='submit'
											loading={form.formState.isSubmitting}
											disabled={form.formState.isSubmitting}
											size='md'
											maxW={{ base: 'full', sm: 'xs' }}
											mt={{ base: '2', sm: '0' }}
											alignSelf={{ base: 'stretch', sm: 'center' }}
										>
											{i18nData.save}
										</SecondaryButton>
									</Stack>
								</RadioCard.Root>
							)}
						/>
						<Field.ErrorText mt='2'>
							{form.formState.errors.notificationMethod?.message?.toString()}
						</Field.ErrorText>
					</Field.Root>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
