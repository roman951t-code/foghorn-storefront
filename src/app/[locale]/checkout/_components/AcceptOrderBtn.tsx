'use client';

import { type ButtonProps } from '@chakra-ui/react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';

interface Props extends ButtonProps {
	text: string;
	disabledReason?: 'auth' | 'contacts' | 'empty' | null;
	onAccept?: () => void;
}

export default function AcceptOrderBtn({ text, disabledReason, onAccept, ...restProps }: Props) {
	return (
		<PrimaryButton
			type='button'
			disabled={!!disabledReason}
			onClick={disabledReason ? undefined : onAccept}
			{...restProps}
		>
			<IoMdCheckmarkCircleOutline />
			{text}
		</PrimaryButton>
	);
}
