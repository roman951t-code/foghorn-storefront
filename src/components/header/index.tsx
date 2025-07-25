import { Box, Stack, Flex } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Sidebar from '../sidebar';
import LocaleSwitcher from './LocaleSwitcher';
import SearchInput from './SearchInput';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import UserActions from './UserActions';
import Logo from './Logo';
import { extractI18nData } from '@/utils/i18nUtils';
import { authLocData, validLocData } from '@/data/localized';
import { ColorModeButton } from '../reusable/chakra/color-mode';
import { Toaster } from '../reusable/chakra/toaster';

export default function Header() {
	const genT = useTranslations('General');
	const t = useTranslations('Header');
	const authT = useTranslations('Auth');
	const validT = useTranslations('Validation');
	const sideT = useTranslations('Sidebar');

	const authI18nData = extractI18nData(authT, authLocData);
	const validI18nData = extractI18nData(validT, validLocData);

	const i18nData = {
		...authI18nData,
		...validI18nData,
	};

	const i18nSidebar = {
		...i18nData,
		lexikoProposal: sideT('lexikoProposal'),
		authorizeDetails: sideT('authorizeDetails'),
		authorize: authT('authorize'),
		deleteAccount: authT('deleteAccount'),
		areYouSure: authT('areYouSure'),
		confirmDeleteAcc: authT('confirmDeleteAcc'),
		deleteFailed: validT('deleteFailed'),
	};

	return (
		<Box
			as='header'
			bg='bg.secondary'
			position='sticky'
			top='0'
			zIndex='1000'
			px={2}
			py={2}
			shadow='sm'
		>
			<Stack>
				<Flex
					justify='space-between'
					align='center'
					mx='auto'
					width='100%'
					maxWidth='1444px'
					pt='4px'
					pb='8px'
					borderBottom={{ smToMd: '1px solid' }}
					borderColor={{ smToMd: 'border.light' }}
					borderStyle={{ smToMd: 'dotted' }}
				>
					<Flex align='center' gap={4}>
						<Sidebar i18nData={i18nSidebar} />
						<Logo />
					</Flex>
					<SearchInput
						hideBelow='md'
						placeholder={t('search')}
						notFound={genT('resultsNotFound')}
					/>
					<Flex align='center' gap={3}>
						<UserActions i18nData={i18nData} />
						<LocaleSwitcher />
						<ColorModeButton />
					</Flex>
				</Flex>
				<Flex
					hideFrom='md'
					justify='flex-end'
					p='4px'
					align='center'
					mx='auto'
					width='100%'
					maxWidth='1444px'
					gap={{ base: 0, sm: 4 }}
				>
					<CatalogBtn hideBelow='sm' fullText={false} />
					<SearchInput placeholder={t('search')} notFound={genT('resultsNotFound')} />
				</Flex>
			</Stack>
			<Toaster />
		</Box>
	);
}
