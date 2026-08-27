'use client';

import dynamic from 'next/dynamic';
import { type ComponentProps } from 'react';
import { IconButton, Spinner } from '@chakra-ui/react';

const CartModal = dynamic(() => import('./CartModal'), {
	loading: () => (
		<IconButton
			aria-label='Cart loading'
			size='md'
			variant='ghost'
			color='main.lightOnly'
			rounded='md'
			colorPalette='green'
			bg={{ _hover: 'colorPalette.600' }}
			disabled
			role='status'
			aria-live='polite'
		>
			<Spinner color='white' size='sm' />
		</IconButton>
	),
	ssr: false,
});

export default function CartModalLazy(props: ComponentProps<typeof CartModal>) {
	return <CartModal {...props} />;
}
