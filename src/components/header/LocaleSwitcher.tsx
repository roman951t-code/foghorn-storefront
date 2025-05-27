'use client';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { SegmentedControl } from '@/components/ui/segmented-control';

const locales = ['ua', 'ru'] as const;
type Locale = (typeof locales)[number];

export default function LocaleSwitcher() {
	const pathname = usePathname();
	const router = useRouter();

	const changeLocale = (event: { value: 'UA' | 'RU' }) => {
		router.replace(pathname, { locale: event.value.toLowerCase() });
	};

	const locale = useLocale() as Locale;

	return (
		<SegmentedControl
			defaultValue={locale.toUpperCase()}
			items={['UA', 'RU']}
			size='xs'
			mx='6px'
			hideBelow='xs'
			onValueChange={changeLocale}
		/>
	);
}
