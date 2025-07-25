'use client';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { SegmentedControl } from '../reusable/chakra/segmented-control';

const locales = ['ua', 'ru'] as const;
type Locale = (typeof locales)[number];

export default function LocaleSwitcher() {
	const pathname = usePathname();
	const router = useRouter();

	const locale = useLocale() as Locale;

	const changeLocale = (details: { value: string | null }) => {
		const newLocale = details.value?.toLowerCase();
		if (newLocale === 'ua' || newLocale === 'ru') {
			router.replace(pathname, { locale: newLocale });
		}
	};

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
