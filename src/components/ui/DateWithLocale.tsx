'use client';
import { Text } from '@chakra-ui/react';
import { useLocale } from 'next-intl';

const localeMap = {
	ua: 'uk-UA',
	ru: 'ru-RU',
} as const;

export default function DateWithLocale({ date }: { date: string | Date }) {
	const locale = useLocale();
	const intlLocale = localeMap[locale as keyof typeof localeMap];

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
