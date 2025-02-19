import { FiHeart, FiUser } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import Auth from './Auth';
import Cart from './Cart';

export default function UserActions() {
	return (
		<>
			<Auth />
			<IconButton
				aria-label='Favourite'
				size='md'
				variant='ghost'
				color='main.lightOnly'
				rounded='full'
				colorPalette='red'
				bg={{ _hover: 'colorPalette.400' }}
			>
				<FiHeart />
			</IconButton>
			<Cart />
		</>
	);
}
