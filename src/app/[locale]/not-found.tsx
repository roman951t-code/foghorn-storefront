import { useTranslations } from 'next-intl';
import { EmptyState, VStack, AbsoluteCenter } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';

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
						<LocaleNavLink href='/' textDecoration='underline' textUnderlineOffset='3px'>
							{t('hint')}
						</LocaleNavLink>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		</AbsoluteCenter>
	);
}
