'use client';

import { HStack, Select, createListCollection } from '@chakra-ui/react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
	isAppLocale,
	LANGUAGE_OPTIONS,
	LOCALE_SWITCHER_LABEL,
	type AppLocale,
} from '@/constants/locales';

function FlagIcon({ locale }: { locale: AppLocale }) {
	const commonProps = {
		width: 20,
		height: 14,
		viewBox: '0 0 640 480',
		style: { borderRadius: '2px', flexShrink: 0 },
		'aria-hidden': true,
		focusable: false,
	} as const;

	if (locale === 'uk') {
		return (
			<svg {...commonProps}>
				<rect width='640' height='240' fill='#005BBB' />
				<rect y='240' width='640' height='240' fill='#FFD500' />
			</svg>
		);
	}

	return (
		<svg {...commonProps}>
			<rect width='640' height='480' fill='#012169' />
			<path d='M0 0l640 480m0-480L0 480' stroke='#fff' strokeWidth='96' />
			<path d='M0 0l640 480m0-480L0 480' stroke='#C8102E' strokeWidth='58' />
			<path d='M320 0v480M0 240h640' stroke='#fff' strokeWidth='160' />
			<path d='M320 0v480M0 240h640' stroke='#C8102E' strokeWidth='96' />
		</svg>
	);
}

const languages = createListCollection({
	items: LANGUAGE_OPTIONS,
	itemToString: (item) => item.label,
	itemToValue: (item) => item.value,
});

export default function LocaleSwitcher() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const locale = useLocale() as AppLocale;
	const label = LOCALE_SWITCHER_LABEL;
	const currentLanguage = languages.items.find((item) => item.value === locale);

	const changeLocale = (details: { value: string[] }) => {
		const newLocale = details.value?.[0]?.toLowerCase();
		if (isAppLocale(newLocale) && newLocale !== locale) {
			const search = searchParams.toString();
			const destination = search ? `${pathname}?${search}` : pathname;
			router.replace(destination, { locale: newLocale });
		}
	};

	return (
		<Select.Root
			position='relative'
			aria-label={label}
			rounded='lg'
			collection={languages}
			size='sm'
			w='110px'
			mx='2.5'
			value={[locale]}
			onValueChange={changeLocale}
		>
			<Select.Label srOnly>{label}</Select.Label>
			<Select.HiddenSelect />
			<Select.Control bg={{ base: 'gray.100', _dark: 'gray.800' }} rounded='sm'>
				<Select.Trigger borderColor='border' cursor='pointer' px='2' aria-label={label}>
					<HStack gap='1.5' align='center'>
						{currentLanguage && <FlagIcon locale={currentLanguage.value} />}
						<Select.ValueText fontSize='md' placeholder='-' />
					</HStack>
				</Select.Trigger>
				<Select.IndicatorGroup>
					<Select.Indicator />
				</Select.IndicatorGroup>
			</Select.Control>

			<Select.Positioner zIndex={1600} top='12px'>
				<Select.Content fontSize='md' lineHeight='1.75'>
					{languages.items.map((item) => (
						<Select.Item cursor='pointer' item={item} key={item.value}>
							<HStack gap='1.5' align='center'>
								<FlagIcon locale={item.value} />
								<Select.ItemText>{languages.stringifyItem(item)}</Select.ItemText>
							</HStack>
							<Select.ItemIndicator />
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
		</Select.Root>
	);
}
