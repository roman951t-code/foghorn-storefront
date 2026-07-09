import { Suspense } from 'react';
import { Box, Stack, Flex, Skeleton } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Sidebar from '../sidebar';
import LocaleSwitcher from './LocaleSwitcher';
import SearchInput from './SearchInput';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import UserActions from './UserActions';
import Logo from './Logo';
import { ColorModeButton } from '@/components/ui/chakra/color-mode';
import { Toaster } from '@/components/ui/chakra/toaster';
import type { AppLocale } from '@/constants/locales';

// Takes `locale` as a prop rather than using next-intl's implicit
// `useTranslations` (which resolves locale from request headers). Under
// Cache Components, that implicit locale read counts as runtime data
// access and opts the whole layout out of prerendering.
export default async function Header({ locale }: { locale: AppLocale }) {
	const [commonT, navT, prodT] = await Promise.all([
		getTranslations({ locale, namespace: 'common' }),
		getTranslations({ locale, namespace: 'navigation' }),
		getTranslations({ locale, namespace: 'products' }),
	]);

	return (
		<Box
			as='header'
			bg='bg.secondary'
			position='sticky'
			top='0'
			zIndex='1000'
			px={2}
			py={2.5}
			borderBottomWidth='0.5px'
			borderBottomStyle='solid'
			borderBottomColor={{ base: 'gray.100', _dark: 'gray.600' }}
		>
			<Stack gap='1'>
				<Flex
					justify='space-between'
					align='center'
					mx='auto'
					width='100%'
					maxWidth='1512px'
					pt='4px'
					pb={{ base: '8px', lg: '2px' }}
					minH={{ base: 'auto', lg: '52px' }}
					maxH={{ base: 'initial', lg: '52px' }}
				>
					<Flex align='center' gap={4}>
						<Sidebar />
						<Box hideBelow='xs' mx='3'>
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
						<Suspense fallback={<Skeleton height='40px' width='96px' rounded='md' />}>
							<UserActions />
						</Suspense>
						<Suspense fallback={<Skeleton height='36px' width='110px' rounded='sm' />}>
							<LocaleSwitcher />
						</Suspense>
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
					maxWidth='1512px'
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
