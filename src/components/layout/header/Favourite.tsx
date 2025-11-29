'use client';

import { IconButton, Float, Circle } from '@chakra-ui/react';
import { useSession } from '@/providers/SessionProvider';
import { Link } from '@/i18n/routing';
import { FiHeart } from 'react-icons/fi';
import { useWishList } from '@/hooks/useWishList';

export default function Favourite() {
	const { session } = useSession();
	const { ids: wishListIds } = useWishList();

	const isVisible = session?.session;

	if (!isVisible) {
		return null;
	}

	return (
		<Link href='/cabinet/wishlist'>
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
				{wishListIds.length > 0 && (
					<Float offset='0.5'>
						<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
							{wishListIds.length}
						</Circle>
					</Float>
				)}
				<FiHeart />
			</IconButton>
		</Link>
	);
}
