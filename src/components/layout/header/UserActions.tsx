import { FiHeart } from 'react-icons/fi';
import { IconButton, Float, Circle } from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';

import Auth from './Auth';
import Cart from './Cart';

const AuthBtn = () => (
	<IconButton
		aria-label='Account'
		size='md'
		variant='ghost'
		color='main.lightOnly'
		rounded='full'
		colorPalette='blue'
		bg={{ _hover: 'colorPalette.400' }}
	>
		<FiUser />
	</IconButton>
);

export default function UserActions() {
	return (
		<>
			<Auth trigger={<AuthBtn />} />

			<IconButton
				position='relative'
				aria-label='Favourite'
				size='md'
				variant='ghost'
				color='main.lightOnly'
				rounded='full'
				colorPalette='red'
				bg={{ _hover: 'colorPalette.400' }}
			>
				<Float offset='0.5'>
					<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
						5
					</Circle>
				</Float>
				<FiHeart />
			</IconButton>
			<Cart />
		</>
	);
}
