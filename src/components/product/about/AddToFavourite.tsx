'use client';
import { FiHeart } from 'react-icons/fi';
import { Icon, IconButton } from '@chakra-ui/react';
import { useSession } from '../../providers/SessionProvider';
import { useWishList } from '@/components/providers/WishListProvider';
import { toaster } from '@/components/reusable/chakra/toaster';
import { BsBagHeart } from 'react-icons/bs';
import { Product } from '@/types/product';

interface Props {
	wishlistUpdateFailed: string;
	product: Product;
}

export default function AddToFavourite({ wishlistUpdateFailed, product }: Props) {
	const { session } = useSession();
	const { ids: wishListIds, handleWishAdd, handleWishRemove } = useWishList();

	if (!session?.session || !product) {
		return null;
	}

	const isInWishlist = wishListIds.includes(product?.id);

	const addToWishList = async () => {
		try {
			const result = await handleWishAdd(product);

			if (!result.success) {
				toaster.error({ title: wishlistUpdateFailed, duration: 5000 });
			}
		} catch {
			toaster.error({ title: wishlistUpdateFailed, duration: 5000 });
		}
	};

	const removeFromWishList = async () => {
		try {
			const result = await handleWishRemove(product.id);

			if (!result.success) {
				toaster.error({ title: wishlistUpdateFailed, duration: 5000 });
			}
		} catch {
			toaster.error({ title: wishlistUpdateFailed, duration: 5000 });
		}
	};

	return (
		<IconButton
			onClick={isInWishlist ? removeFromWishList : addToWishList}
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
			{isInWishlist ? (
				<Icon size='md' aria-label='Wish'>
					<BsBagHeart />
				</Icon>
			) : (
				<FiHeart />
			)}
		</IconButton>
	);
}
