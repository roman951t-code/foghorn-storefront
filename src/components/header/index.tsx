import { Box, Stack, Flex } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useTranslations } from 'next-intl';
import Sidebar from '../sidebar';
import LocaleSwitcher from './LocaleSwitcher';
import SearchInput from './SearchInput';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import UserActions from './UserActions';
import Logo from './Logo';

export default function Header() {
	const genT = useTranslations('General');
	const t = useTranslations('Header');

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
						<Sidebar />
						<Logo />
					</Flex>
					<SearchInput
						hideBelow='md'
						placeholder={t('search')}
						notFound={genT('resultsNotFound')}
					/>
					<Flex align='center' gap={3}>
						<UserActions />
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
		</Box>
	);
}
