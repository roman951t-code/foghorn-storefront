'use client';
import React from 'react';
import { Button } from '@chakra-ui/react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { useSession } from '@/components/providers/SessionProvider';

interface Props {
	text: string;
	[key: string]: any;
}

export default function AcceptOrderBtn({ text, ...restProps }: Props) {
	const { session } = useSession();
	return (
		<Button
			type='submit'
			bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
			color='black'
			variant='solid'
			disabled={!session.session}
			{...restProps}
		>
			<IoMdCheckmarkCircleOutline />
			{text}
		</Button>
	);
}
