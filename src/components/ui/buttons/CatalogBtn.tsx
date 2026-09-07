'use client';

import { Button, HStack } from '@chakra-ui/react';
import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import {
	DrawerActionTrigger,
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/chakra/drawer';
import CatalogDrawer from '@/components/layout/sidebar/CatalogDrawer';
import { TbCategory2 } from 'react-icons/tb';
import { PrimaryButton } from './ActionButton';
import { usePathname } from '@/i18n/routing';

interface Props {
	fullText: boolean;
	hideBelow?: string;
	hideFrom?: string;
	trigger?: ReactElement;
}

export default function CatalogBtn({ hideBelow, hideFrom, fullText, trigger }: Props) {
	const t = useTranslations('common');
	const authT = useTranslations('auth');
	const catalogFull = t('catalogFull');
	const text = fullText ? catalogFull : t('catalog');
	const triggerElement = trigger ?? (
		<PrimaryButton width={fullText ? '100%' : undefined} hideBelow={hideBelow} hideFrom={hideFrom}>
			<TbCategory2 />
			{text}
		</PrimaryButton>
	);

	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// CatalogBtn lives in the persistent header/sidebar layout, so it never
	// unmounts on navigation. Force-close on route change so a link clicked
	// inside the drawer (which navigates away) can't leave it stuck open.
	// The `key={pathname}` also fully remounts the DrawerRoot on every route
	// change, guaranteeing Ark UI's internal state can't carry an "open"
	// value across navigations even if the controlled `open` were somehow
	// out of sync.
	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<HStack wrap='wrap'>
			<DrawerRoot
				key={pathname}
				size='full'
				placement='top'
				open={open}
				onOpenChange={(e) => setOpen(e.open)}
			>
				<DrawerBackdrop />
				<DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
				<DrawerContent
					w={{ base: '96%', xl: '77%' }}
					maxW='1460px'
					m='auto'
					maxHeight='96%'
					bg='bg.tertiary'
					rounded='lg'
				>
					<DrawerBody maxW='1512px' margin='auto' w='full' pt={{ base: '6', md: '7' }} pb='4'>
						<CatalogDrawer />
					</DrawerBody>
					<DrawerFooter>
						<DrawerActionTrigger asChild>
							<Button borderColor='border' variant='outline' rounded='md'>
								{authT('close')}
							</Button>
						</DrawerActionTrigger>
					</DrawerFooter>
					<DrawerCloseTrigger borderColor={{ _hover: 'border' }} />
				</DrawerContent>
			</DrawerRoot>
		</HStack>
	);
}
