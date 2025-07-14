'use client';

import { Box, Card, IconButton, QrCode, Separator } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import {
	DrawerBackdrop,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import MediaContacts from '@/components/reusable/links/MediaContacts';
import CollapsibleLinks from './CollapsibleLinks';
import UserLinks from './UserLinks';
import Image from 'next/image';
import { LogoutSection, AuthorizeSection } from './AuthorizeSection';
import { useSession } from '../providers/SessionProvider';
import { I18nData } from '@/types/i18n';
import Auth from '../auth/Auth';
import { DeleteAccount } from './DeleteAccount';

const logoBig = '/assets/images/logoBig.webp';
const logoHeight = 36;
const logoWidth = 170;

const Logo = () => {
	return (
		<Link href='/'>
			<Image
				src={logoBig}
				width={logoWidth}
				height={logoHeight}
				style={{ width: 'auto', height: 'auto' }}
				alt='logo'
			/>
		</Link>
	);
};

export default function SidePanel({ i18nData }: { i18nData: I18nData }) {
	const [open, setOpen] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);

	const { session } = useSession();

	const onClose = () => {
		setOpen(false);
	};

	const onAuthOpen = () => {
		setAuthOpen(true);
		onClose();
	};

	return (
		<>
			<DrawerRoot placement='start' open={open} onOpenChange={(e) => setOpen(e.open)}>
				<DrawerBackdrop />
				<DrawerTrigger asChild>
					<IconButton
						aria-label='Menu'
						color='main.lightOnly'
						variant='ghost'
						size='md'
						bg='transparent'
						_hover={{
							bg: 'transparent',
							border: '1px solid',
							borderColor: 'main.lightOnly',
						}}
					>
						<FiMenu />
					</IconButton>
				</DrawerTrigger>
				<DrawerContent bg='bg.tertiary' minWidth='320px' display='flex' flexDirection='column'>
					<DrawerHeader bg='bg.secondary'>
						<Logo />
					</DrawerHeader>

					<Box flex='1' overflowY='auto' display='flex' flexDirection='column' height='100dvh'>
						<Box px={4} my={4} h='100%'>
							<CatalogBtn fullText />
							<Separator borderColor='border.light' my='5' />
							{session?.session ? (
								<>
									<LogoutSection onClose={onClose} />
									<Separator borderColor='border.light' my='5' />
								</>
							) : (
								<>
									<AuthorizeSection
										i18nData={i18nData}
										authOpen={authOpen}
										onAuthOpen={onAuthOpen}
									/>
									<Separator borderColor='border.light' my='5' />
								</>
							)}
							{session?.session && <UserLinks onClose={onClose} />}
							<Separator borderColor='border.light' my='5' />
							<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' mt='4'>
								<Card.Body gap='4'>
									<QrCode.Root
										value='https://play.google.com/store/apps/details?id=com.lexiko&hl=uk'
										m='auto'
									>
										<QrCode.Frame>
											<QrCode.Pattern />
										</QrCode.Frame>
									</QrCode.Root>
									<Card.Description color='main' textStyle='sm' textAlign='left'>
										{i18nData.lexikoProposal}
									</Card.Description>
								</Card.Body>
							</Card.Root>
							<Separator borderColor='border.light' my='5' />
							<CollapsibleLinks onClose={onClose} />
						</Box>
						{session?.session && <DeleteAccount i18nData={i18nData} />}

						<DrawerFooter bg='bg.secondary' mt='auto'>
							<MediaContacts />
						</DrawerFooter>
					</Box>

					<DrawerCloseTrigger
						color='main.lightOnly'
						_hover={{
							bg: 'transparent',
							border: '1px solid',
							borderColor: 'main.lightOnly',
						}}
					/>
				</DrawerContent>
			</DrawerRoot>
			<Auth i18nData={i18nData} isOpen={authOpen} setIsOpen={setAuthOpen} />
		</>
	);
}
