import { Button, HStack } from '@chakra-ui/react';
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
import CatalogDrawer from '../../reusable/drawer/CatalogDrawer';

interface Props {
	fullText: boolean;
	hideBelow?: string;
	hideFrom?: string;
	trigger?: JSX.Element;
}

export default function CatalogBtn({ hideBelow, hideFrom, fullText, trigger }: Props) {
	const t = useTranslations('General');
	const text = fullText ? t('catalogFull') : t('catalogShort');

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
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<g clipPath='url(#clip0_21580_82648)'>
									<path
										d='M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z'
										fill='#111827'
									></path>
								</g>
								<defs>
									<clipPath id='clip0_21580_82648'>
										<rect width='24' height='24' fill='black'></rect>
									</clipPath>
								</defs>
							</svg>
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
