'use client';

import { PrimaryButton } from '../../reusable/buttons/ActionButton';
import { FiShoppingCart } from 'react-icons/fi';
import { toaster } from '@/components/reusable/chakra/toaster';
import { useState } from 'react';
import { I18nData } from '@/types/i18n';
import CartModal from '@/components/header/CartModal';
import { useCart } from '@/components/providers/CartProvider';
import { Product } from '@/types/product';

interface AddToCartButtonProps {
	i18nData: I18nData;
	product: Product;
}

export default function AddToCartButton({ i18nData, product }: AddToCartButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const { productIds, handleAddItem } = useCart();
	const isInCart = productIds.includes(product?.id);

	const handleAdd = async () => {
		setIsLoading(true);
		try {
			await handleAddItem(product);
		} catch {
			toaster.error({ title: i18nData.cartUpdateFailed, duration: 5000 });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{!isInCart && (
				<PrimaryButton w='200px' onClick={handleAdd} loading={isLoading}>
					<FiShoppingCart />
					{i18nData.buyText}
				</PrimaryButton>
			)}
			<CartModal i18nData={i18nData} triggerType='button' isInCart={isInCart} />
		</>
	);
}
