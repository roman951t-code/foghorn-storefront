'use client';

import { IconButton, Image, Separator } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import {
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import MediaContacts from '@/components/reusable/links/MediaContacts';
import CollapsibleLinks from './CollapsibleLinks';
import UserLinks from './UserLinks';
import { LogoutSection, AuthorizeSection } from './AuthorizeSection';

const logoBig = '/assets/images/logoBig.webp';

const Logo = () => {
	return (
		<Link href='/'>
			<Image src={logoBig} fit='cover' minWidth='36px' h='36px' alt='logo' />
		</Link>
	);
};

export default function SidePanel() {
	const { data: session, status } = useSession();

	const [open, setOpen] = useState(false);

	const onClose = () => {
		setOpen(false);
	};

	return (
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
			<DrawerContent bg='bg.tertiary' minWidth='320px'>
				<DrawerHeader bg='bg.secondary'>
					<Logo />
				</DrawerHeader>
				<DrawerBody mt={4} px={4}>
					<CatalogBtn fullText />
					<Separator borderColor='border.light' my='5' />
					<AuthorizeSection />
					<Separator borderColor='border.light' my='5' />
					<LogoutSection />
					<Separator borderColor='border.light' my='5' />
					<UserLinks onClose={onClose} />
					<Separator borderColor='border.light' my='5' />
					<CollapsibleLinks onClose={onClose} />
				</DrawerBody>
				<DrawerFooter bg='bg.secondary'>
					<MediaContacts />
				</DrawerFooter>
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
	);
}
