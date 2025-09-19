import { FiUser } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import Auth from '../auth/Auth';
import CartModal from './CartModal';
import { I18nData } from '@/types/i18n';
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

export default function UserActions({ i18nData }: { i18nData: I18nData }) {
	const cartT = useTranslations('Cart');
	const headT = useTranslations('Header');
	const prodT = useTranslations('Products');

	const cartI18nData = {
		cart: cartT('cart'),
		emptyCart: cartT('emptyCart'),
		emptyCartDescr: cartT('emptyCartDescr'),
		order: headT('order'),
		totalAmount: prodT('totalAmount'),
		numOfProducts: prodT('numOfProducts'),
		cartRemoveFailed: cartT('cartRemoveFailed'),
	};

	return (
		<>
			<Auth trigger={<AuthBtn />} i18nData={i18nData} />
			<UpdateEmailModal i18nData={i18nData} />
			<Favourite />
			<CartModal i18nData={cartI18nData} />
		</>
	);
}
