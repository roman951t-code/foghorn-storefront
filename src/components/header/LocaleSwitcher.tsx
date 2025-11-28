'use client';

import { Box, Portal, Select, createListCollection } from '@chakra-ui/react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

const languages = createListCollection({
	items: [
		{ value: 'ua', label: 'УКР', flag: '🇺🇦' },
		{ value: 'us', label: 'ENG', flag: '🇺🇸' },
	],
	itemToString: (item) => item.label,
	itemToValue: (item) => item.value,
});

export default function LocaleSwitcher() {
	const pathname = usePathname();
	const router = useRouter();
	const locale = useLocale() as 'ua' | 'us';

	const changeLocale = (details: { value: string[] }) => {
		const newLocale = details.value?.[0]?.toLowerCase();
		if (newLocale === 'ua' || newLocale === 'us') {
			router.replace(pathname, { locale: newLocale });
		}
	};

	return (
		<Select.Root
			position='relative'
			bg={{ base: 'gray.100', _dark: 'gray.800' }}
			rounded='sm'
			collection={languages}
			size='sm'
			w='110px'
			mx='2.5'
			defaultValue={[locale]}
			onValueChange={changeLocale}
		>
			<Select.HiddenSelect />
			<Select.Control>
				<Select.Trigger borderColor='border.light' cursor='pointer' px='2'>
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

			<Portal>
				<Select.Positioner zIndex='tooltip' top='12px'>
					<Select.Content fontSize='md' lineHeight='1.75'>
						{languages.items.map((item) => (
							<Select.Item cursor='pointer' item={item} key={item.value}>
								{item.flag} {languages.stringifyItem(item)}
								<Select.ItemIndicator />
							</Select.Item>
						))}
					</Select.Content>
				</Select.Positioner>
			</Portal>
		</Select.Root>
	);
}
