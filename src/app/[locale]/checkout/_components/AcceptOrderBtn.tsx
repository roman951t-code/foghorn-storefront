'use client';

import { type ButtonProps } from '@chakra-ui/react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';

interface Props extends ButtonProps {
	text: string;
	disabledReason?: 'auth' | 'contacts' | 'address' | 'empty' | 'consents' | null;
	onAccept?: () => void;
}

export default function AcceptOrderBtn({ text, disabledReason, onAccept, ...restProps }: Props) {
	const isDisabled = !!disabledReason || !!restProps.loading;

	return (
		<PrimaryButton
			type='button'
			disabled={isDisabled}
			onClick={isDisabled ? undefined : onAccept}
			{...restProps}
		>
			<IoMdCheckmarkCircleOutline />
			{text}
		</PrimaryButton>
	);
}
