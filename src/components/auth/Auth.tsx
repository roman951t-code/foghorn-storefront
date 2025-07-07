'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import type { I18nData } from '@/types/i18n';
import Image from 'next/image';
import Login from './Login';
import Signup from './Signup';
import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';

const emptyCart = '/assets/images/emptyCart.png';

interface Props {
	i18nData: I18nData;
	trigger?: React.JSX.Element;
}

export default function Auth({ i18nData, trigger }: Props) {
	const { data: session } = authClient.useSession();
	const [showSignup, setShowSignup] = useState(false);

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!emailSignIn || session) return;

		if (emailSignIn) {
			setIsOpen(true);
		}
	}, [emailSignIn, session]);

	const toggleSignup = () => {
		setShowSignup((prevState) => !prevState);
	};

	const title = session
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
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Box maxW='400px' mx='auto' my='auto'>
				{!session && (
					<>
						{showSignup ? (
							<Signup i18nData={i18nData} backToLogin={toggleSignup} />
						) : (
							<Login i18nData={i18nData} moveToSignup={toggleSignup} />
						)}
					</>
				)}

				{session && (
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
						<Button
							onClick={() => setIsOpen(false)}
							w='100%'
							type='submit'
							color='black'
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
						>
							{i18nData.continuePurchases}
						</Button>
					</VStack>
				)}
			</Box>
		</CenteredModal>
	);
}
