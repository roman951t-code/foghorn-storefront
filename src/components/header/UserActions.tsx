import { FiUser } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import Auth from '../auth/Auth';
import Cart from './Cart';
import SetNewPassModal from '../auth/SetNewPassModal';
import { I18nData } from '@/types/i18n';
import Favourite from './Favourite';
import { useTranslations } from 'next-intl';

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
	const headT = useTranslations('Header');
	const prodT = useTranslations('Products');

	const cartI18nData = {
		cart: headT('cart'),
		emptyCart: headT('emptyCart'),
		emptyCartDescr: headT('emptyCartDescr'),
		order: headT('order'),
		totalAmount: prodT('totalAmount'),
		numOfProducts: prodT('numOfProducts'),
	};

	return (
		<>
			<Auth trigger={<AuthBtn />} i18nData={i18nData} />
			<SetNewPassModal i18nData={i18nData} />
			<Favourite />
			<Cart i18nData={cartI18nData} />
		</>
	);
}
