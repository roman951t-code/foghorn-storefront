'use client';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { useSession } from '@/providers/SessionProvider';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { ButtonProps } from '@chakra-ui/react';

interface Props extends ButtonProps {
	text: string;
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
