'use client';

import { Field, RadioCard, Stack, Icon, Button, Fieldset } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';
import { useMemo } from 'react';
import z from 'zod';
import { useTransition } from 'react';
import { setNotificationMethodAction } from '@/actions/setNotificationMethodAction';

interface Props {
	userEmail: string;
	schemaShape: any;
	i18nData: I18nData;
}

export default function PreferredDeliveryForm({ schemaShape, userEmail, i18nData }: Props) {
	const notificationSchema = useMemo(
		() => z.object({ notificationMethod: schemaShape.notificationMethod }),
		[schemaShape]
	);

	const form = useForm({
		defaultValues: {
			notificationMethod: '',
		},
		resolver: zodResolver(notificationSchema),
	});

	const [isPending, startTransition] = useTransition();

	const onSubmit = (data: { notificationMethod: string }) => {
		startTransition(() => {
			setNotificationMethodAction(null, {
				notificationMethod: data.notificationMethod as 'email' | 'phone',
			});
		});
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
						<RadioCard.Root
							w='100%'
							colorPalette={{ base: 'orange', _dark: 'yellow' }}
							orientation='horizontal'
							value={form.watch('notificationMethod')}
							onChange={(val) => form.setValue('notificationMethod', val)}
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
									value={'email'}
									boxShadow='none'
									_hover={{ cursor: 'pointer' }}
									w='full'
									bg='main'
									justifyContent={{ base: 'initial', xs: 'center' } as any}
									h={{ base: 'auto', sm: '42px' }}
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
									value={'phone'}
									boxShadow='none'
									_hover={{ cursor: 'pointer' }}
									w='full'
									bg='main'
									justifyContent={{ base: 'initial', xs: 'center' } as any}
									h={{ base: 'auto', sm: '42px' }}
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
								<Button
									type='submit'
									color='black'
									bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
									variant='solid'
									size='md'
									rounded='md'
									maxW={{ base: 'full', sm: 'xs' }}
									loading={isPending}
								>
									{i18nData.save}
								</Button>
							</Stack>
							<Field.ErrorText mt='2'>
								{form.formState.errors.notificationMethod?.message?.toString()}
							</Field.ErrorText>
						</RadioCard.Root>
					</Field.Root>
				</Fieldset.Content>
			</Fieldset.Root>
		</form>
	);
}
