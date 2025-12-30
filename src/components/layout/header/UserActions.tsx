import { FiUser } from 'react-icons/fi';
import { Box, IconButton } from '@chakra-ui/react';
import Favourite from './Favourite';
import { useTranslations } from 'next-intl';
import UpdateEmailModal from '@/features/auth/UpdateEmailModal';
import Auth from '@/features/auth/Auth';
import { getCartModalI18nData } from '@/constants/cart';
import CartModalLazy from './CartModalLazy';

const AuthBtn = () => (
	<IconButton
		aria-label='Account'
		size='md'
		variant='ghost'
		color='main.lightOnly'
		rounded='full'
		colorPalette='blue'
		bg={{ _hover: 'colorPalette.400' }}
		_focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-blue-400)' }}
	>
		<FiUser />
	</IconButton>
);

export default function UserActions() {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');

	const cartI18nData = getCartModalI18nData(cartT, navT, prodT);

	return (
		<>
			<Auth trigger={<AuthBtn />} />
			<UpdateEmailModal />
			<Box hideBelow='sm'>
				<Favourite />
			</Box>
			<CartModalLazy i18nData={cartI18nData} />
		</>
	);
}
