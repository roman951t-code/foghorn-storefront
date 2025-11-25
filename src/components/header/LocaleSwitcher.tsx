'use client';

import { Portal, Select, createListCollection } from '@chakra-ui/react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

const languages = createListCollection({
	items: [
		{ value: 'ua', label: 'Українська', flag: '🇺🇦' },
		{ value: 'us', label: 'English (US)', flag: '🇺🇸' },
	],
	itemToString: (item) => `${item.flag} ${item.label}`,
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
			bg='bg'
			rounded='sm'
			collection={languages}
			size='sm'
			w='174px'
			defaultValue={[locale]}
			onValueChange={changeLocale}
		>
			<Select.HiddenSelect />
			<Select.Control>
				<Select.Trigger borderColor='border.light' cursor='pointer'>
					<Select.ValueText fontSize='md' placeholder='-' />
				</Select.Trigger>
				<Select.IndicatorGroup>
					<Select.Indicator />
				</Select.IndicatorGroup>
			</Select.Control>

			<Portal>
				<Select.Positioner>
					<Select.Content fontSize='md' lineHeight='1.75'>
						{languages.items.map((item) => (
							<Select.Item cursor='pointer' item={item} key={item.value}>
								{languages.stringifyItem(item)}
								<Select.ItemIndicator />
							</Select.Item>
						))}
					</Select.Content>
				</Select.Positioner>
			</Portal>
		</Select.Root>
	);
}
