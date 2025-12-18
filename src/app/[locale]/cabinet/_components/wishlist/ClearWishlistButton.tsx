'use client';

import { useTransition } from 'react';
import { IconButton, Icon } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { useWishListStore } from '@/stores/wishListStore';
import { useRouter } from 'next/navigation';

export default function ClearWishlistButton() {
	const handleClear = useWishListStore((state) => state.handleClear);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const onClear = () => {
		startTransition(async () => {
			await handleClear();
			router.refresh();
		});
	};

	return (
		<IconButton
			size='md'
			aria-label='Clear wishlist'
			variant='ghost'
			rounded='full'
			colorPalette='gray'
			color='main.disabled'
			transition='all 0.2s ease-in-out'
			_hover={{
				bg: 'colorPalette.500',
				color: 'main.lightOnly',
			}}
			onClick={onClear}
			disabled={isPending}
		>
			<Icon size='lg'>
				<FiTrash2 />
			</Icon>
		</IconButton>
	);
}
