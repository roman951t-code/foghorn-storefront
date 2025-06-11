import { Button, HStack } from '@chakra-ui/react';
import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import {
	DrawerActionTrigger,
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/drawer';
import CatalogDrawer from '@/components/reusable/drawer/CatalogDrawer';
import { TbCategory2 } from 'react-icons/tb';

interface Props {
	fullText: boolean;
	hideBelow?: string;
	hideFrom?: string;
	trigger?: JSX.Element;
}

export default function CatalogBtn({ hideBelow, hideFrom, fullText, trigger }: Props) {
	const t = useTranslations('General');
	const catalogFull = t('catalogFull');
	const catalogShort = t('catalogShort');
	const text = fullText ? catalogFull : catalogShort;

	return (
		<HStack wrap='wrap'>
			<DrawerRoot size='full' placement='top'>
				<DrawerBackdrop />
				<DrawerTrigger asChild>
					{trigger || (
						<Button
							color='black'
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							variant='solid'
							width={fullText ? '100%' : ''}
							hideBelow={hideBelow}
							hideFrom={hideFrom}
						>
							<TbCategory2 />
							{text}
						</Button>
					)}
				</DrawerTrigger>
				<DrawerContent
					w={{ base: '96%', xl: '77%' }}
					m='auto'
					maxHeight='96%'
					bg='bg.tertiary'
					rounded='md'
				>
					<DrawerHeader></DrawerHeader>
					<DrawerBody>
						<CatalogDrawer />
					</DrawerBody>
					<DrawerFooter>
						<DrawerActionTrigger asChild>
							<Button borderColor='border' variant='outline'>
								{t('close')}
							</Button>
						</DrawerActionTrigger>
					</DrawerFooter>
					<DrawerCloseTrigger borderColor={{ _hover: 'border' }} />
				</DrawerContent>
			</DrawerRoot>
		</HStack>
	);
}
