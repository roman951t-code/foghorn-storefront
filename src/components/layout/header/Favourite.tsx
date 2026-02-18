'use client';

import { useMemo } from 'react';
import { IconButton, Float, Circle } from '@chakra-ui/react';
import { useSession } from '@/providers/SessionProvider';
import { Link } from '@/i18n/routing';
import { FiHeart } from 'react-icons/fi';
import { useWishList } from '@/hooks/useWishList';

interface Props {
	onRequireAuth?: () => void;
}

function WishListButton({
	count,
	onClick,
}: {
	count: number;
	onClick?: () => void;
}) {
	return (
		<IconButton
			onClick={onClick}
			position='relative'
			aria-label='Wishlist'
			size='md'
			variant='ghost'
			color='main.lightOnly'
			rounded='md'
			colorPalette='red'
			bg={{ _hover: 'colorPalette.400' }}
		>
			{count > 0 && (
				<Float offset='0.5'>
					<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
						{count}
					</Circle>
				</Float>
			)}
			<FiHeart />
		</IconButton>
	);
}

export default function Favourite({ onRequireAuth }: Props) {
	const { session } = useSession();
	const { ids: wishListIds } = useWishList();
	const wishlistCount = useMemo(() => new Set(wishListIds).size, [wishListIds]);

	if (!session?.session) {
		return <WishListButton count={wishlistCount} onClick={onRequireAuth} />;
	}

	return (
		<Link href='/cabinet/wishlist'>
			<WishListButton count={wishlistCount} />
		</Link>
	);
}
