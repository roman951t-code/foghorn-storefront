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
} from '@/components/reusable/chakra/drawer';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import MediaContacts from '@/components/reusable/links/MediaContacts';
import Image from 'next/image';
import { useSession } from '../providers/SessionProvider';
import Auth from '../auth/Auth';
import { AuthorizeSection, LogoutSection } from './AuthorizeSection';
import UserLinks from './UserLinks';
import CollapsibleLinks from './CollapsibleLinks';
import { DeleteAccount } from './DeleteAccount';

const logoBig = '/assets/images/logoBig.webp';
const logoHeight = 36;
const logoWidth = 170;

const Logo = () => (
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

export default function SidePanel() {
	const [open, setOpen] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);
	const { session } = useSession();

	const onClose = () => setOpen(false);
	const onAuthOpen = () => {
		setAuthOpen(true);
		onClose();
	};

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
						<Box
							px={4}
							my={4}
							h='100%'
							overflowY='auto'
							display='flex'
							flexDirection='column'
							gap='5'
						>
							<CatalogBtn fullText />
							<Separator borderColor='border.light' />

							{session?.session ? (
								<>
									<LogoutSection onClose={onClose} />
									<Separator borderColor='border.light' />
								</>
							) : (
								<>
									<AuthorizeSection onAuthOpen={onAuthOpen} />
									<Separator borderColor='border.light' />
								</>
							)}

							{session?.session && (
								<>
									<UserLinks userName={session.user?.name} onClose={onClose} />
									<Separator borderColor='border.light' />
								</>
							)}

							<Separator borderColor='border.light' />

							<CollapsibleLinks onClose={onClose} />

							{session?.session && (
								<Box mt='auto' pt='4'>
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
							border: '1px solid',
							borderColor: 'main.lightOnly',
						}}
					/>
				</DrawerContent>
			</DrawerRoot>
			<Auth isOpen={authOpen} setIsOpen={setAuthOpen} />
		</>
	);
}
