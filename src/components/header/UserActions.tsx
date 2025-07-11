import { FiUser } from 'react-icons/fi';
import { IconButton } from '@chakra-ui/react';
import Auth from '../auth/Auth';
import Cart from './Cart';
import SetNewPassModal from '../auth/SetNewPassModal';
import { I18nData } from '@/types/i18n';
import Favourite from './Favourite';

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
	return (
		<>
			<Auth trigger={<AuthBtn />} i18nData={i18nData} />
			<SetNewPassModal i18nData={i18nData} />
			<Favourite />
			<Cart />
		</>
	);
}
