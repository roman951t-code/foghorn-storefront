'use client';

import { FiShoppingCart } from 'react-icons/fi';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useState } from 'react';
import { I18nData } from '@/types/i18n';
import CartModal from '@/components/layout/header/CartModal';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';

interface AddToCartButtonProps {
	i18nData: I18nData;
	product: Product;
}

export default function AddToCartButton({ i18nData, product }: AddToCartButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { productIds, handleAddItem } = useCart();

	if (!product) return null;

	const isInCart = productIds.includes(product?.id);

	const handleAdd = async () => {
		setIsLoading(true);

		try {
			const result = await handleAddItem(product);

			if (!result.success) {
				showToaster('error', toasterMessages.cartUpdateFailed(i18nData.cartUpdateFailed));
			}
		} catch {
			showToaster('error', toasterMessages.cartUpdateFailed(i18nData.cartUpdateFailed));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{!isInCart && (
				<PrimaryButton fontSize='15px' gapX='3' w='200px' onClick={handleAdd} loading={isLoading}>
					<FiShoppingCart />
					{i18nData.buyText}
				</PrimaryButton>
			)}
			<CartModal i18nData={i18nData} triggerType='button' isInCart={isInCart} />
		</>
	);
}
