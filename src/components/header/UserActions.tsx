import { FiHeart } from 'react-icons/fi';
import { IconButton, Float, Circle } from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { extractI18nData } from '@/utils/i18nUtils';
import { authLocData, validLocData } from '@/data/localized';

import Auth from '../auth/Auth';
import Cart from './Cart';

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
	const authT = useTranslations('Auth');
	const validT = useTranslations('Validation');

	const authI18nData = extractI18nData(authT, authLocData);
	const validI18nData = extractI18nData(validT, validLocData);

	const i18nData = {
		...authI18nData,
		...validI18nData,
	};

	return (
		<>
			<Auth trigger={<AuthBtn />} i18nData={i18nData} />

			<IconButton
				position='relative'
				aria-label='Favourite'
				size='md'
				variant='ghost'
				color='main.lightOnly'
				rounded='full'
				colorPalette='red'
				bg={{ _hover: 'colorPalette.400' }}
			>
				<Float offset='0.5'>
					<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
						5
					</Circle>
				</Float>
				<FiHeart />
			</IconButton>
			<Cart />
		</>
	);
}
