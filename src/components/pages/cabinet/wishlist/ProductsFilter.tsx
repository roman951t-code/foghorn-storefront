'use client';
import { useTranslations } from 'next-intl';
import { Select, createListCollection } from '@chakra-ui/react';

export default function ProductsFilter() {
	const t = useTranslations('Products');

	const options = createListCollection({
		items: [
			{ label: t('new'), value: 'new' },
			{ label: t('expensiveToCheap'), value: 'expensiveToCheap' },
			{ label: t('cheapToExpensive'), value: 'cheapToExpensive' },
		],
	});

	return (
		<Select.Root collection={options} size='sm' width='240px' defaultValue={['new']}>
			<Select.HiddenSelect />
			<Select.Control>
				<Select.Trigger>
					<Select.ValueText />
				</Select.Trigger>
				<Select.IndicatorGroup>
					<Select.Indicator />
				</Select.IndicatorGroup>
			</Select.Control>
			<Select.Positioner>
				<Select.Content width='240px'>
					{options.items.map((option) => (
						<Select.Item item={option} key={option.value} fontSize='sm'>
							{option.label}
							<Select.ItemIndicator />
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
		</Select.Root>
	);
}
