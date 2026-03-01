'use client';

import { FiShoppingCart } from 'react-icons/fi';
import { IconButton, Stack, Float, Circle, EmptyState, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import Image from 'next/image';
import { useState } from 'react';
import { I18nData } from '@/types/i18n';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import CartWithProducts from './CartWithProducts';
import { LuCheck } from 'react-icons/lu';
import { useCart } from '@/hooks/useCart';
import { ASSET_IMAGES } from '@/constants/assets';

type CartBtnProps = {
	setIsOpen: (isOpen: boolean) => void;
	cartSize: number;
};

const CartBtn = ({ setIsOpen, cartSize }: CartBtnProps) => (
	<IconButton
		onClick={() => setIsOpen(true)}
		aria-label='Cart'
		size='md'
		variant='ghost'
		position='relative'
		color='main.lightOnly'
		rounded='md'
		colorPalette='green'
		bg={{ _hover: 'colorPalette.600' }}
		_focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-green-400)' }}
	>
		{cartSize > 0 && (
			<Float offset='0.5'>
				<Circle size='5' bg='bg.accent' color='black' fontSize='14px' fontWeight='semibold'>
					{cartSize}
				</Circle>
			</Float>
		)}
		<FiShoppingCart />
	</IconButton>
);

interface Props {
	triggerType?: string;
	isInCart?: boolean;
	i18nData: I18nData;
}

export default function CartModal({ i18nData, triggerType, isInCart }: Props) {
	const { cartData } = useCart();
	const isCartEmpty = cartData.items.length === 0;
	const [isOpen, setIsOpen] = useState(false);

	const { items: cartItems } = cartData;

	const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

	return (
		<CenteredModal
			dialogId='cart-modal'
			title={i18nData.cart}
			trigger={
				triggerType === 'button' ? (
					isInCart && (
						<PrimaryButton w='200px'>
							<LuCheck />
							{i18nData.productInCartText}
						</PrimaryButton>
					)
				) : (
					<CartBtn setIsOpen={setIsOpen} cartSize={totalCount} />
				)
			}
			size={isCartEmpty ? 'md' : 'lg'}
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			{isCartEmpty ? (
				<Stack direction='column' alignItems='center' py='2' gap='4'>
					<Image
						src={ASSET_IMAGES.emptyCart}
						width={240}
						height={240}
						alt='empty cart'
						style={{
							objectFit: 'cover',
							width: '240px',
							height: '240px',
							marginLeft: '-54px',
						}}
					/>

					<EmptyState.Root paddingBlock='0'>
						<EmptyState.Content>
							<VStack textAlign='center' gap='2'>
								<EmptyState.Title fontSize='xl'>{i18nData.emptyCart}</EmptyState.Title>
								<EmptyState.Description fontSize='md'>
									{i18nData.emptyCartDescr}
								</EmptyState.Description>
							</VStack>
						</EmptyState.Content>
					</EmptyState.Root>
				</Stack>
			) : (
				<CartWithProducts setIsOpen={setIsOpen} i18nData={i18nData} />
			)}
		</CenteredModal>
	);
}
