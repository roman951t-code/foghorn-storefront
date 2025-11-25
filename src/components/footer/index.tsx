import { Box, Flex, Text, Link, Group } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import MediaContacts from '@/components/reusable/links/MediaContacts';

export default function Footer() {
	const t = useTranslations('common');

	return (
		<Box as='footer' bg='bg.secondary' mt='12' px={4}>
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
					© 2025 Prosperity.com
				</Text>
				<MediaContacts hideBelow='md' />
				<Group>
					<Text color='main.lightOnly'>{t('design')}</Text>
					<Link href='#' variant='underline' color='main.secondary' _focus={{ outline: 'none' }}>
						Foghorn
					</Link>
				</Group>
			</Flex>
		</Box>
	);
}
