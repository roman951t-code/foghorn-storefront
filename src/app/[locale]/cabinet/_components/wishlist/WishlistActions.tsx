'use client';

import { useCallback, useTransition } from 'react';
import { HStack, IconButton, Icon, Wrap } from '@chakra-ui/react';
import { IoShareSocialOutline } from 'react-icons/io5';
import ProductsFilter from './ProductsFilter';
import ClearWishlistButton from './ClearWishlistButton';
import { showToaster } from '@/utils/toast';
import type { I18nData } from '@/types/i18n';

type Props = {
	i18nData: I18nData;
	shareCopiedText: string;
	countSlot?: React.ReactNode;
};

export default function WishlistActions({ i18nData, shareCopiedText, countSlot }: Props) {
	const [isSharing, startTransition] = useTransition();

	const handleShare = useCallback(() => {
		startTransition(async () => {
			const url = `${window.location.origin}/cabinet/wishlist`;
			try {
				await navigator.clipboard.writeText(url);
				showToaster('success', shareCopiedText, 6000);
			} catch {
				showToaster('error', shareCopiedText, 6000);
			}
		});
	}, [shareCopiedText]);

	return (
		<>
			<Wrap w='full' justifyContent='space-between' alignItems='center' gap='4'>
				{countSlot}
				<HStack gapX='4'>
					<ProductsFilter i18nData={i18nData} />
					<IconButton
						size='md'
						aria-label='Share wishlist'
						variant='ghost'
						rounded='full'
						colorPalette='orange'
						color='colorPalette.500'
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.500',
							color: 'main.lightOnly',
						}}
						onClick={handleShare}
						disabled={isSharing}
					>
						<Icon size='lg'>
							<IoShareSocialOutline />
						</Icon>
					</IconButton>
					<ClearWishlistButton />
				</HStack>
			</Wrap>
		</>
	);
}
