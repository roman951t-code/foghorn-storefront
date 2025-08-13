'use client';
import { FiHeart } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import { useSession } from '../../providers/SessionProvider';

export default function AddToFavourite() {
	const { session } = useSession();

	if (!session?.session) {
		return null;
	}

	return (
		<IconButton
			aria-label='Favourite'
			variant='ghost'
			rounded='full'
			colorPalette='red'
			color='colorPalette.400'
			transition='all 0.2s ease-in-out'
			_hover={{
				bg: 'colorPalette.400',
				color: 'main.lightOnly',
			}}
		>
			<FiHeart />
		</IconButton>
	);
}
