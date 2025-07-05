'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/dialogs/CenteredModal';
import type { I18nData } from '@/types/i18n';
import Image from 'next/image';
import { toaster } from '@/components/ui/toaster';
import Login from './Login';
import Signup from './Signup';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';

const emptyCart = '/assets/images/emptyCart.png';

interface Props {
	i18nData: I18nData;
	trigger?: React.JSX.Element;
}

export default function Auth({ i18nData, trigger }: Props) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [showSignup, setShowSignup] = useState(false);

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const [forceOpen, setForceOpen] = useState(false);

	useEffect(() => {
		if (!emailSignIn) return;
		if (session) return;

		if (emailSignIn) {
			setForceOpen(true);
			setTimeout(() =>
				toaster.success({
					title: 'Toast Title',
					description: 'Toast Description',
					duration: 8000,
					closable: true,
				})
			),
				10;

			const current = new URLSearchParams(window.location.search);
			current.delete('email-sign-in');
			const newSearch = current.toString();
			const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
			router.replace(newPath);
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
			open={forceOpen}
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
							onClick={async () => await authClient.signOut()}
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
