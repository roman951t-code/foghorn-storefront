'use client';
import React, { useEffect, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import type { I18nData } from '@/types/i18n';
import Image from 'next/image';
import Login from './Login';
import Signup from './Signup';
import { useSearchParams } from 'next/navigation';
import { useSession } from '../providers/SessionProvider';
import { PrimaryButton } from '../reusable/buttons/ActionButton';

const emptyCart = '/assets/images/emptyCart.png';

interface Props {
	i18nData: I18nData;
	trigger?: React.JSX.Element;
	isOpen?: boolean;
	setIsOpen?: (value: boolean) => void;
}

export default function Auth({ i18nData, trigger, isOpen, setIsOpen }: Props) {
	const { session } = useSession();
	const [showSignup, setShowSignup] = useState(false);

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const [isAuthOpen, setAuthOpen] = useState(false);

	useEffect(() => {
		if (!emailSignIn) return;

		if (emailSignIn) {
			setAuthOpen(true);
		}
	}, [emailSignIn, session]);

	const toggleSignup = () => {
		setShowSignup((prevState) => !prevState);
	};

	const handleCloseClick = () => {
		if (setIsOpen) {
			setIsOpen(false);
		}
		if (setAuthOpen) {
			setAuthOpen(false);
		}
	};

	const title = session?.session
		? `${i18nData.returnCongrats}, Roman!`
		: showSignup
			? i18nData.register
			: i18nData.authorize;

	return (
		<CenteredModal
			closeOnInteractOutside={false}
			title={title}
			trigger={trigger}
			size='md'
			open={isOpen ?? isAuthOpen}
			setIsOpen={setIsOpen ?? setAuthOpen}
		>
			<Box maxW='400px' mx='auto' my='auto'>
				{!session?.session && (
					<>
						{showSignup ? (
							<Signup i18nData={i18nData} backToLogin={toggleSignup} />
						) : (
							<Login i18nData={i18nData} moveToSignup={toggleSignup} />
						)}
					</>
				)}

				{session?.session && (
					<VStack gap='8'>
						<Image
							src={emptyCart}
							width='230'
							height='230'
							alt='empty cart'
							style={{
								objectFit: 'cover',
								width: '230px',
								height: '230px',
								marginLeft: -45,
							}}
						/>
						<PrimaryButton onClick={handleCloseClick} w='100%' type='submit'>
							{i18nData.continuePurchases}
						</PrimaryButton>
					</VStack>
				)}
			</Box>
		</CenteredModal>
	);
}
