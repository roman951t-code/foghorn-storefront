import { Box, Stack, Flex } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Sidebar from '../sidebar';
import LocaleSwitcher from './LocaleSwitcher';
import SearchInput from './SearchInput';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import UserActions from './UserActions';
import Logo from './Logo';
import { ColorModeButton } from '../reusable/chakra/color-mode';
import { Toaster } from '../reusable/chakra/toaster';

export default function Header() {
	const commonT = useTranslations('common');
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');

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
						placeholder={navT('header.search')}
						notFound={commonT('resultsNotFound')}
						products={prodT('products')}
						seeAll={commonT('seeAll')}
						categories={prodT('categories')}
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
					<SearchInput
						placeholder={navT('header.search')}
						seeAll={commonT('seeAll')}
						notFound={commonT('resultsNotFound')}
						products={prodT('products')}
						categories={prodT('categories')}
					/>
				</Flex>
			</Stack>
			<Toaster />
		</Box>
	);
}
