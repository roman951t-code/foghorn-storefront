'use client';

import { Card, IconButton, QrCode, Separator } from '@chakra-ui/react';
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
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import MediaContacts from '@/components/reusable/links/MediaContacts';
import CollapsibleLinks from './CollapsibleLinks';
import UserLinks from './UserLinks';
import Image from 'next/image';
import { LogoutSection, AuthorizeSection } from './AuthorizeSection';
import { useTranslations } from 'next-intl';

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

export default function SidePanel() {
	const [open, setOpen] = useState(false);
	const t = useTranslations('Sidebar');

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
								{t('lexikoProposal')}
							</Card.Description>
						</Card.Body>
					</Card.Root>
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
