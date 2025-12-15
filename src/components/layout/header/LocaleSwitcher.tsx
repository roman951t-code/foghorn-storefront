'use client';

import { Box, Select, createListCollection } from '@chakra-ui/react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

const languages = createListCollection({
	items: [
		{ value: 'ua', label: 'Укр', flag: '🇺🇦' },
		{ value: 'us', label: 'Eng', flag: '🇺🇸' },
	],
	itemToString: (item) => item.label,
	itemToValue: (item) => item.value,
});

export default function LocaleSwitcher() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const locale = useLocale() as 'ua' | 'us';
	const label = 'Change language';

	const changeLocale = (details: { value: string[] }) => {
		const newLocale = details.value?.[0]?.toLowerCase();
		if (newLocale === 'ua' || newLocale === 'us') {
			const search = searchParams.toString();
			const destination = search ? `${pathname}?${search}` : pathname;
			router.replace(destination, { locale: newLocale });
		}
	};

	return (
		<Select.Root
			position='relative'
			aria-label={label}
			bg={{ base: 'gray.100', _dark: 'gray.800' }}
			rounded='sm'
			collection={languages}
			size='sm'
			w='110px'
			mx='2.5'
			defaultValue={[locale]}
			onValueChange={changeLocale}
		>
			<Select.Label srOnly>{label}</Select.Label>
			<Select.HiddenSelect />
			<Select.Control>
				<Select.Trigger borderColor='border.light' cursor='pointer' px='2' aria-label={label}>
					<Select.ValueText fontSize='md' placeholder='-'>
						{languages.items.find((item) => item.value === locale)?.flag}
						<Box as='span' ml='2'>
							{languages.items.find((item) => item.value === locale)?.label}
						</Box>
					</Select.ValueText>
				</Select.Trigger>
				<Select.IndicatorGroup>
					<Select.Indicator />
				</Select.IndicatorGroup>
			</Select.Control>

			<Select.Positioner zIndex={1600} top='12px'>
				<Select.Content fontSize='md' lineHeight='1.75'>
					{languages.items.map((item) => (
						<Select.Item cursor='pointer' item={item} key={item.value}>
							{item.flag} {languages.stringifyItem(item)}
							<Select.ItemIndicator />
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
		</Select.Root>
	);
}
