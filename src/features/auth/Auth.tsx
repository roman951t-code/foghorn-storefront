'use client';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/providers/SessionProvider';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import Signup from './Signup';
import Login from './Login';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { I18nData } from '@/types/i18n';
import {
	ACCOUNT_VALIDATION_MESSAGE_KEYS,
	AUTH_MESSAGE_KEYS,
} from '@/data/localeMessages/authMessages';
import { ASSET_IMAGES } from '@/constants/assets';

interface Props {
	trigger?: JSX.Element;
	isOpen?: boolean;
	setIsOpen?: (value: boolean) => void;
}

export default function Auth({ trigger, isOpen, setIsOpen }: Props) {
	const authT = useTranslations('auth');
	const validT = useTranslations('validation');
	const { session, refresh } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const i18nData = useMemo<I18nData>(() => {
		const authEntries = AUTH_MESSAGE_KEYS.map((key) => [key, authT(key)]);
		const validationEntries = ACCOUNT_VALIDATION_MESSAGE_KEYS.map((key) => [key, validT(key)]);
		return Object.fromEntries([...authEntries, ...validationEntries]);
	}, [authT, validT]);

	const [showSignup, setShowSignup] = useState(false);
	const [isAuthOpen, setAuthOpen] = useState(false);

	const refreshSession = async () => {
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
	};

	useEffect(() => {
		if (!emailSignIn) return;

		if (emailSignIn) {
			const handleEmailSignIn = async () => {
				const current = new URLSearchParams(window.location.search);
				current.delete('email-sign-in');
				const newSearch = current.toString();
				const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
				router.replace(newPath);

				await refreshSession();
			};

			handleEmailSignIn();
			setAuthOpen(true);
		}
	}, [emailSignIn]);

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
		? `${i18nData.returnCongrats}, ${session?.user?.name}!`
		: showSignup
		? i18nData.register
		: i18nData.authorize;

	return (
		<CenteredModal
			dialogId='auth-modal'
			closeOnInteractOutside={false}
			title={`${title}`}
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
							src={ASSET_IMAGES.emptyCart}
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
