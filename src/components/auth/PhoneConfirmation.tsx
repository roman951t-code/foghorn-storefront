'use client';

import React, { useEffect, useState } from 'react';
import { Button, PinInput, Highlight, Fieldset, Text } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function PhoneConfirmation({ i18nData }: Props) {
	const [timer, setTimer] = useState(0);

	useEffect(() => {
		if (timer <= 0) return;

		const id = setInterval(() => {
			setTimer((t) => {
				if (t <= 1) {
					clearInterval(id);
					return 0;
				}
				return t - 1;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [timer]);

	const formatTime = (sec: number) => {
		const m = Math.floor(sec / 60)
			.toString()
			.padStart(2, '0');
		const s = (sec % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const formattedTime = formatTime(timer);

	return (
		<Fieldset.Root size='lg'>
			<Fieldset.Legend fontSize='md'>{i18nData.phoneConfirmation}</Fieldset.Legend>
			<Fieldset.HelperText fontSize='md' lineHeight='1.5'>
				На номер
				<Highlight query='+380-99-230-4351' styles={{ fontWeight: 'semibold', mx: 1.5 }}>
					+380-99-230-4351
				</Highlight>
				<Text color='fg.muted'>{i18nData.activationCodeSent}</Text>
				{i18nData.activationCodeSentSuffix}
			</Fieldset.HelperText>

			<Fieldset.Content>
				<PinInput.Root otp my='2' justifyContent='center'>
					<PinInput.HiddenInput />
					<PinInput.Control w='100%' justifyContent='center'>
						{Array.from({ length: 6 }).map((_, i) => (
							<PinInput.Input key={i} _focus={{ outline: 'none' }} index={i} />
						))}
					</PinInput.Control>
				</PinInput.Root>
			</Fieldset.Content>

			<Button
				mt='8'
				w='100%'
				type='submit'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				color='black'
				variant='solid'
			>
				{i18nData.confirmPhone}
			</Button>

			{timer > 0 ? (
				<Fieldset.HelperText fontSize='15px' color='main'>
					{i18nData.resendAfter}:
					<Highlight
						query={formattedTime}
						styles={{ fontWeight: 'semibold', color: 'main.accent', ml: '2' }}
					>
						{formattedTime}
					</Highlight>
				</Fieldset.HelperText>
			) : (
				<Button
					mt='4'
					variant='outline'
					border='1px solid'
					borderColor='border'
					onClick={() => {
						setTimer(120);
						action({ phone: '' });
					}}
				>
					{i18nData.resendCode}
				</Button>
			)}
		</Fieldset.Root>
	);
}
