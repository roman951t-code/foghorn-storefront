'use client';

import { Box, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import {
	DrawerBackdrop,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/chakra/drawer';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import MediaContacts from '@/components/ui/links/MediaContacts';
import Image from 'next/image';
import { useSession } from '@/providers/SessionProvider';
import Auth from '@/features/auth/Auth';
import { AuthorizeSection, LogoutSection } from './AuthorizeSection';
import CollapsibleLinks from './CollapsibleLinks';
import { DeleteAccount } from './DeleteAccount';
import { ASSET_IMAGES } from '@/constants/assets';

const logoHeight = 36;
const logoWidth = 170;

function Logo({ onClick }: { onClick?: () => void }) {
	return (
		<Link href='/' onClick={onClick}>
			<Image src={ASSET_IMAGES.logoBig} width={logoWidth} height={logoHeight} alt='logo' />
		</Link>
	);
}

export default function SidePanel() {
	const [open, setOpen] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);
	const { session } = useSession();
	const pathname = usePathname();

	const onClose = () => setOpen(false);
	const onAuthOpen = () => {
		setAuthOpen(true);
		onClose();
	};

	// Sidebar persists across navigation. Links nested inside it (e.g. the
	// catalog drawer's category/product links) navigate away without going
	// through onClose, which left this drawer stuck open on return. Closing
	// on every route change covers those links too.
	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<>
			<DrawerRoot
				placement='start'
				open={open}
				onOpenChange={(e) => setOpen(e.open)}
				closeOnInteractOutside={true}
			>
				<DrawerBackdrop />
				<DrawerTrigger asChild>
					<IconButton
						aria-label='Menu'
						color='main.lightOnly'
						variant='ghost'
						size='md'
						rounded='md'
						bg='transparent'
						_hover={{
							bg: 'transparent',
							borderWidth: '0.5px',
							borderStyle: 'solid',
							borderColor: 'main.lightOnly',
						}}
					>
						<FiMenu />
					</IconButton>
				</DrawerTrigger>

				<DrawerContent bg='bg.tertiary' minWidth='320px' display='flex' flexDirection='column'>
					<DrawerHeader bg='bg.secondary'>
						<Logo onClick={onClose} />
					</DrawerHeader>

					<Box flex='1' overflowY='auto' display='flex' flexDirection='column' height='100dvh'>
						<Box
							px={6}
							my={4}
							h='100%'
							overflowY='auto'
							display='flex'
							flexDirection='column'
							gapY='8'
						>
							<CatalogBtn fullText />

							{session?.session ? (
								<LogoutSection onClose={onClose} />
							) : (
								<AuthorizeSection onAuthOpen={onAuthOpen} />
							)}

							<CollapsibleLinks
								onClose={onClose}
								isAuthorized={!!session?.session}
								userName={session?.user?.name ?? undefined}
							/>

							{session?.session && (
								<Box mt='auto'>
									<DeleteAccount onCloseAction={onClose} />
								</Box>
							)}
						</Box>

						<DrawerFooter bg='bg.secondary' mt='auto'>
							<MediaContacts />
						</DrawerFooter>
					</Box>

					<DrawerCloseTrigger
						color='main.lightOnly'
						_hover={{
							bg: 'transparent',
							borderWidth: '0.5px',
							borderStyle: 'solid',
							borderColor: 'main.lightOnly',
						}}
					/>
				</DrawerContent>
			</DrawerRoot>

			<Auth isOpen={authOpen} setIsOpen={setAuthOpen} />
		</>
	);
}
