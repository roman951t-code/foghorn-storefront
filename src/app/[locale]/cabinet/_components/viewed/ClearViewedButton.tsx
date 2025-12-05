'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type ButtonProps } from '@chakra-ui/react';
import { clearRecentlyViewedProducts } from '@/actions/products/clearRecentlyViewedProducts';
import { TertiaryButton } from '@/components/ui/buttons/ActionButton';

type Props = ButtonProps & {
	text: string;
};

export default function ClearViewedButton({ text, ...buttonProps }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { isDisabled, ...restProps } = buttonProps;

	const handleClear = () => {
		startTransition(async () => {
			const res = await clearRecentlyViewedProducts();
			if (res?.success) {
				router.refresh();
			}
		});
	};

	return (
		<TertiaryButton
			{...restProps}
			onClick={handleClear}
			isLoading={isPending}
			isDisabled={isPending || isDisabled}
		>
			{text}
		</TertiaryButton>
	);
}
