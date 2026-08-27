import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { APP_LOCALES, DEFAULT_LOCALE } from '@/constants/locales';

export const routing = defineRouting({
	locales: APP_LOCALES,
	defaultLocale: DEFAULT_LOCALE,
	localePrefix: 'as-needed',
	localeDetection: true,
});

export const { Link, usePathname, useRouter } = createNavigation(routing);
