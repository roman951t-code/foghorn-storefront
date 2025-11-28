import { useTranslations } from 'next-intl';
import { EmptyState, VStack, AbsoluteCenter } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';

export default function NotFoundPage() {
	const t = useTranslations('pages');

	return (
		<AbsoluteCenter>
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{t('notFound.title')}</EmptyState.Title>
						<LocaleNavLink href='/' textDecoration='underline' textUnderlineOffset='3px'>
							{t('notFound.hint')}
						</LocaleNavLink>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		</AbsoluteCenter>
	);
}
