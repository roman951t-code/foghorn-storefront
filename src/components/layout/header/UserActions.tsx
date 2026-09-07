'use client';

import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { Box, IconButton } from '@chakra-ui/react';
import Favourite from './Favourite';
import { useTranslations } from 'next-intl';
import UpdateEmailModal from '@/features/auth/UpdateEmailModal';
import Auth from '@/features/auth/DynamicAuth';
import { getCartModalI18nData } from '@/constants/cart';
import CartModalLazy from './CartModalLazy';

type AuthBtnProps = {
	onClick?: () => void;
};

const AuthBtn = ({ onClick }: AuthBtnProps) => (
	<IconButton
		onClick={onClick}
		aria-label='Account'
		size='md'
		variant='ghost'
		color='main.lightOnly'
		rounded='md'
		colorPalette='orange'
		bg={{ _hover: 'colorPalette.400' }}
		_focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-cyan-400)' }}
	>
		<FiUser />
	</IconButton>
);

export default function UserActions() {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');
	const [isAuthOpen, setAuthOpen] = useState(false);

	const cartI18nData = getCartModalI18nData(cartT, navT, prodT);

	return (
		<>
			<Auth
				trigger={<AuthBtn onClick={() => setAuthOpen(true)} />}
				isOpen={isAuthOpen}
				setIsOpen={setAuthOpen}
			/>
			<UpdateEmailModal />
			<Box hideBelow='sm'>
				<Favourite onRequireAuth={() => setAuthOpen(true)} />
			</Box>
			<CartModalLazy i18nData={cartI18nData} />
		</>
	);
}
