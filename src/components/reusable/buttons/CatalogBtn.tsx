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
	DrawerRoot,
	DrawerTrigger,
} from '@/components/reusable/chakra/drawer';
import CatalogDrawer from '@/components/reusable/drawer/CatalogDrawer';
import { TbCategory2 } from 'react-icons/tb';
import { PrimaryButton } from './ActionButton';

interface Props {
	fullText: boolean;
	hideBelow?: string;
	hideFrom?: string;
	trigger?: JSX.Element;
}

export default function CatalogBtn({ hideBelow, hideFrom, fullText, trigger }: Props) {
	const t = useTranslations('General');
	const authT = useTranslations('Auth');
	const catalogFull = t('catalogFull');
	const text = fullText ? catalogFull : 'Каталог';

	return (
		<HStack wrap='wrap'>
			<DrawerRoot size='full' placement='top'>
				<DrawerBackdrop />
				<DrawerTrigger asChild>
					{trigger || (
						<PrimaryButton width={fullText ? '100%' : ''} hideBelow={hideBelow} hideFrom={hideFrom}>
							<TbCategory2 />
							{text}
						</PrimaryButton>
					)}
				</DrawerTrigger>
				<DrawerContent
					w={{ base: '96%', xl: '77%' }}
					m='auto'
					maxHeight='96%'
					bg='bg.tertiary'
					rounded='md'
				>
					<DrawerBody>
						<CatalogDrawer />
					</DrawerBody>
					<DrawerFooter>
						<DrawerActionTrigger asChild>
							<Button borderColor='border' variant='outline'>
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
