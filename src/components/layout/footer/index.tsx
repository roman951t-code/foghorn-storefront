import { Box, Flex, Text, Link, Group } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import MediaContacts from '@/components/ui/links/MediaContacts';
import type { AppLocale } from '@/constants/locales';

// Takes `locale` as a prop rather than using next-intl's implicit
// `useTranslations` (which resolves locale from request headers). Under
// Cache Components, that implicit locale read counts as runtime data
// access and opts the whole layout out of prerendering.
export default async function Footer({ locale }: { locale: AppLocale }) {
	const t = await getTranslations({ locale, namespace: 'common' });

	return (
		<Box
			as='footer'
			bg='bg.secondary'
			mt='12'
			px={4}
			borderTopWidth='0.5px'
			borderTopStyle='solid'
			borderTopColor={{ base: 'gray.100', _dark: 'gray.600' }}
		>
			<Flex
				hideFrom='md'
				pt='8px'
				align='center'
				justify={'center'}
				ml='-8px'
				width='100%'
				maxW='1444px'
			>
				<MediaContacts />
			</Flex>
			<Flex
				justify='space-between'
				align='center'
				mx='auto'
				minHeight='60px'
				width='100%'
				flexWrap='wrap'
				maxW='1444px'
				my={{ base: 4, sm: 0 }}
				gap={2}
			>
				<Text mr={{ base: '12px', md: '0' }} color='main.lightOnly'>
					© 2026 Prosperity.com
				</Text>
				<MediaContacts hideBelow='md' />
				<Group>
					<Text color='main.lightOnly'>{t('design')}</Text>
					<Link
						href='https://foghornbay.com/'
						variant='underline'
						color='main.secondary'
						_focusVisible={{
							outline: '2px solid',
							outlineColor: 'main.secondary',
							outlineOffset: '2px',
						}}
					>
						Foghorn
					</Link>
				</Group>
			</Flex>
		</Box>
	);
}
