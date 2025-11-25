import { FiUser } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import Auth from '../auth/Auth';
import CartModal from './CartModal';
import Favourite from './Favourite';
import { useTranslations } from 'next-intl';
import UpdateEmailModal from '../auth/UpdateEmailModal';

const AuthBtn = () => (
	<IconButton
		aria-label='Account'
		size='md'
		variant='ghost'
		color='main.lightOnly'
		rounded='full'
		colorPalette='blue'
		bg={{ _hover: 'colorPalette.400' }}
	>
		<FiUser />
	</IconButton>
);

export default function UserActions() {
	const cartT = useTranslations('cart');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');

	const cartI18nData = {
		cart: cartT('cart'),
		emptyCart: cartT('emptyCart'),
		emptyCartDescr: cartT('emptyCartDescr'),
		order: navT('header.order'),
		totalAmount: prodT('totalAmount'),
		numOfProducts: prodT('numOfProducts'),
		cartRemoveFailed: cartT('cartRemoveFailed'),
	};

	return (
		<>
			<Auth trigger={<AuthBtn />} />
			<UpdateEmailModal />
			<Favourite />
			<CartModal i18nData={cartI18nData} />
		</>
	);
}
