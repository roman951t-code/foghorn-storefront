'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type ButtonProps } from '@chakra-ui/react';
import { clearRecentlyViewedProducts } from '@/actions/products/clearRecentlyViewedProducts';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';

type Props = ButtonProps & {
	text: string;
	// Reviewed tab now reads through a client cache (useCabinetCache) instead
	// of a server-rendered prop, so router.refresh() alone no longer picks up
	// the clear — the caller uses this to invalidate/refetch its own cache.
	onCleared?: () => void;
};

export default function ClearViewedButton({ text, onCleared, ...buttonProps }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { disabled, ...restProps } = buttonProps;

	const handleClear = () => {
		startTransition(async () => {
			const res = await clearRecentlyViewedProducts();
			if (res?.success) {
				if (onCleared) {
					onCleared();
				} else {
					router.refresh();
				}
			}
		});
	};

	return (
		<SecondaryButton
			{...restProps}
			onClick={handleClear}
			loading={isPending}
			disabled={isPending || disabled}
		>
			{text}
		</SecondaryButton>
	);
}
