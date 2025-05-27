'use client';
import { Select, createListCollection } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function ProductsFilter({ i18nData }: Props) {
	const options = createListCollection({
		items: [
			{ label: i18nData.new, value: 'new' },
			{ label: i18nData.expensiveToCheap, value: 'expensiveToCheap' },
			{ label: i18nData.cheapToExpensive, value: 'cheapToExpensive' },
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
						<Select.Item item={option} key={option.value} fontSize='md'>
							{option.label}
							<Select.ItemIndicator />
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
		</Select.Root>
	);
}
