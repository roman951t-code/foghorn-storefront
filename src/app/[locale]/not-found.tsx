import { useTranslations } from 'next-intl';
import { EmptyState, VStack, AbsoluteCenter, Link as ChakraLink } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { Link } from '@/i18n/routing';

export default function NotFoundPage() {
	const t = useTranslations('NotFoundPage');
	return (
		<AbsoluteCenter>
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{t('title')}</EmptyState.Title>

						<Link href='/'>
							<ChakraLink
								as='span'
								transition='all .15s ease-in-out'
								textDecorationColor='main'
								_hover={{ color: 'link' }}
								_focus={{ outline: 'none' }}
							>
								{t('hint')}
							</ChakraLink>
						</Link>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		</AbsoluteCenter>
	);
}
