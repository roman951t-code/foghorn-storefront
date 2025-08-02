'use client';

import { Field, RadioCard, Stack, Icon, Fieldset } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import { useState } from 'react';
import type { I18nData } from '@/types/i18n';
import { setNotificationMethodAction } from '@/actions/auth/setNotificationMethodAction';
import { SecondaryButton } from '@/components/reusable/buttons/ActionButton';
import { toaster } from '@/components/reusable/chakra/toaster';

interface Props {
	userEmail: string;
	userPhone: string;
	userNotifMethod: 'email' | 'phone';
	refreshSession: () => void;
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
	refreshSession,
}: Props) {
	const [isPending, setIsPending] = useState(false);
	const form = useForm<NotificationFormValues>({
		defaultValues: {
			notificationMethod: userNotifMethod,
		},
	});

	const onSubmit = async (data: NotificationFormValues) => {
		setIsPending(true);
		try {
			const result = await setNotificationMethodAction(null, {
				notificationMethod: data.notificationMethod as 'email' | 'phone',
			});

			if (result?.success) {
				toaster.success({
					title: i18nData.notifUpdated,
					duration: 5000,
				});
				await refreshSession();
			} else {
				toaster.error({
					title: i18nData.preferedNotifFailed,
					duration: 5000,
				});
			}
		} catch {
			toaster.error({
				title: i18nData.preferedNotifFailed,
				duration: 5000,
			});
		} finally {
			setIsPending(false);
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
						orientation={{ base: 'vertical', md: 'horizontal' }}
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
											justifyContent={{ base: 'initial', xs: 'center' } as any}
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
											justifyContent={{ base: 'initial', xs: 'center' } as any}
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
											loading={isPending}
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
