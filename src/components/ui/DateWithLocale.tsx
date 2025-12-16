'use client';
import { Text } from '@chakra-ui/react';
import { useLocale } from 'next-intl';
import { DEFAULT_LOCALE, LOCALE_TO_INTL_MAP } from '@/constants/locales';

export default function DateWithLocale({ date }: { date: string | Date }) {
	const locale = useLocale();
	const intlLocale =
		LOCALE_TO_INTL_MAP[locale as keyof typeof LOCALE_TO_INTL_MAP] ??
		LOCALE_TO_INTL_MAP[DEFAULT_LOCALE];

	const formattedDate = new Date(date)
		.toLocaleDateString(intlLocale, {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
		.replace('.', '');

	return (
		<Text as='span' color='main' textStyle='sm'>
			{formattedDate}
		</Text>
	);
}
