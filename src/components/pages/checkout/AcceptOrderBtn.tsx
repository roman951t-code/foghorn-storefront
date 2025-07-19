'use client';
import React from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { useSession } from '@/components/providers/SessionProvider';
import { PrimaryButton } from '@/components/reusable/buttons/ActionButton';

interface Props {
	text: string;
	[key: string]: any;
}

export default function AcceptOrderBtn({ text, ...restProps }: Props) {
	const { session } = useSession();
	return (
		<PrimaryButton type='submit' disabled={!session?.session} {...restProps}>
			<IoMdCheckmarkCircleOutline />
			{text}
		</PrimaryButton>
	);
}
