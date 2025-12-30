'use client';

import dynamic from 'next/dynamic';
import { type ComponentProps } from 'react';
import { Spinner, Flex } from '@chakra-ui/react';

const CartModal = dynamic(() => import('./CartModal'), {
	loading: () => (
		<Flex align='center' justify='center' minW='48px' minH='48px' role='status' aria-live='polite'>
			<Spinner color='white' size='sm' />
		</Flex>
	),
	ssr: false,
});

export default function CartModalLazy(props: ComponentProps<typeof CartModal>) {
	return <CartModal {...props} />;
}
