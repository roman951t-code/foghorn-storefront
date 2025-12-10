'use client';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, createListCollection } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function ProductsFilter({ i18nData }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const options = useMemo(
		() =>
			createListCollection({
				items: [
					{ label: i18nData.new, value: 'new' },
					{ label: i18nData.expensiveToCheap, value: 'expensive' },
					{ label: i18nData.cheapToExpensive, value: 'cheap' },
				],
			}),
		[i18nData]
	);

	const handleChange = (details: any) => {
		const value = Array.isArray(details.value) ? details.value[0] : details.value;
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set('orderBy', value);
		} else {
			params.delete('orderBy');
		}
		router.replace(`${window.location.pathname}?${params.toString()}`);
	};

	const current = searchParams.get('orderBy') || 'new';

	return (
		<Select.Root
			collection={options}
			size='sm'
			maxW='240px'
			minW='200px'
			value={[current]}
			onValueChange={handleChange}
			aria-label='Sort wishlist products'
		>
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
				<Select.Content w='240px'>
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
