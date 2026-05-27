import { Box, Stack, Flex } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Sidebar from '../sidebar';
import LocaleSwitcher from './LocaleSwitcher';
import SearchInput from './SearchInput';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import UserActions from './UserActions';
import Logo from './Logo';
import { ColorModeButton } from '@/components/ui/chakra/color-mode';
import { Toaster } from '@/components/ui/chakra/toaster';

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
			borderBottomWidth='0.5px'
			borderBottomStyle='solid'
			borderBottomColor={{ base: 'gray.100', _dark: 'gray.600' }}
		>
			<Stack gap='0'>
				<Flex
					justify='space-between'
					align='center'
					mx='auto'
					width='100%'
					maxWidth='1444px'
					pt='4px'
					pb='8px'
					minH='52px'
					borderBottomWidth={{ smToMd: '0.5px' }}
					borderBottomColor={{ smToMd: 'border' }}
					borderBottomStyle={{ smToMd: 'dotted' }}
				>
					<Flex align='center' gap={4}>
						<Sidebar />
						<Box hideBelow='xs'>
							<Logo />
						</Box>
					</Flex>
					<SearchInput
						hideBelow='lg'
						placeholder={navT('header.search')}
						notFound={commonT('resultsNotFound')}
						products={prodT('products')}
						seeAll={commonT('seeAll')}
						categories={prodT('categories')}
					/>
					<Flex align='center' gap={4}>
						<UserActions />
						<LocaleSwitcher />
						<ColorModeButton />
					</Flex>
				</Flex>
				<Flex
					hideFrom='lg'
					justify='flex-end'
					p='4px'
					align='center'
					mx='auto'
					width='100%'
					maxWidth='1444px'
					gap={{ base: 0, sm: 4 }}
					minH='48px'
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
