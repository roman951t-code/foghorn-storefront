'use client';
import { Field, RadioCard, Stack, Icon, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';

interface Props {
	schema: any;
	i18nData: I18nData;
	onSubmitAction: (data: { notificationMethod: string }) => void;
}

const items = [
	{ value: 'email', title: 'Email', icon: <IoMailOutline /> },
	{ value: 'phone', title: 'Телефон', icon: <IoMdPhonePortrait /> },
];

export default function PreferredDeliveryForm({ schema, i18nData, onSubmitAction }: Props) {
	const form = useForm({
		defaultValues: {
			notificationMethod: '',
		},
		resolver: zodResolver(schema),
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmitAction)}>
			<Field.Root
				orientation={{ base: 'vertical', md: 'horizontal' }}
				invalid={!!form.formState.errors.notificationMethod}
				gap='4'
				justifyContent='center'
			>
				<RadioCard.Root
					mt='8'
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
						{items.map((item) => (
							<RadioCard.Item
								key={item.value}
								value={item.value}
								boxShadow='none'
								_hover={{ cursor: 'pointer' }}
								maxW='xs'
								bg='main'
								justifyContent={{ base: 'initial', xs: 'center' }}
								h={{ base: 'auto', sm: '42px' }}
							>
								<RadioCard.ItemHiddenInput />
								<RadioCard.ItemControl alignItems='center'>
									<Icon fontSize='2xl' color='fg.muted'>
										{item.icon}
									</Icon>
									<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
									<RadioCard.ItemIndicator />
								</RadioCard.ItemControl>
							</RadioCard.Item>
						))}
						<Button
							type='submit'
							color='main'
							variant='outline'
							border='1px solid '
							colorPalette='gray'
							borderColor='border'
							size='md'
							rounded='md'
							maxW='xs'
						>
							{i18nData.save}
						</Button>
					</Stack>
					<Field.ErrorText mt='2'>
						{form.formState.errors.notificationMethod?.message?.toString()}
					</Field.ErrorText>
				</RadioCard.Root>
			</Field.Root>
		</form>
	);
}
