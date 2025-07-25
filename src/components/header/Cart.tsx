'use client';

import { FiShoppingCart } from 'react-icons/fi';
import { IconButton, Stack, Float, Circle, EmptyState } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import Image from 'next/image';
import { useState } from 'react';
import { I18nData } from '@/types/i18n';
import dynamic from 'next/dynamic.js';

const emptyCart = '/assets/images/emptyCart.png';

const CartWithProducts = dynamic(() => import('./CartWithProducts.tsx'));

const CartBtn = ({ setIsOpen }: { setIsOpen: any }) => (
	<IconButton
		onClick={setIsOpen}
		aria-label='Cart'
		size='md'
		variant='ghost'
		position='relative'
		color='main.lightOnly'
		rounded='full'
		colorPalette='green'
		bg={{ _hover: 'colorPalette.600' }}
	>
		<Float offset='0.5'>
			<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
				5
			</Circle>
		</Float>
		<FiShoppingCart />
	</IconButton>
);

interface Props {
	i18nData: I18nData;
}

export default function Cart({ i18nData }: Props) {
	const isCartEmpty = false;

	const [isOpen, setIsOpen] = useState(false);

	return (
		<CenteredModal
			title={i18nData.cart}
			trigger={<CartBtn setIsOpen={setIsOpen} />}
			size={isCartEmpty ? 'md' : 'lg'}
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			{isCartEmpty ? (
				<Stack direction='column'>
					<Image
						src={emptyCart}
						width='240'
						height='240'
						alt='empty cart'
						style={{
							objectFit: 'cover',
							width: '240px',
							height: '240px',
						}}
					/>
					<EmptyState
						paddingBlock='0'
						paddingBottom={8}
						title={i18nData.emptyCart}
						description={i18nData.emptyCartDescr}
					/>
				</Stack>
			) : (
				<CartWithProducts setIsOpen={setIsOpen} i18nData={i18nData} />
			)}
		</CenteredModal>
	);
}
