'use client';

import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { Checkbox } from '@/components/ui/chakra/checkbox';
import { Filter } from '@/types/product';
import { VStack, CheckboxGroup, Fieldset } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
	filters: Filter[] | null;
};

export default function Filters({ filters }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const t = useTranslations('products');

	const updateParams = useCallback(
		(key: string, values: string[]) => {
			const params = new URLSearchParams(searchParams.toString());

			params.delete(key);

			values.forEach((value) => params.append(key, value));

			router.push(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams]
	);

	if (!filters || filters.length === 0) {
		return null;
	}

	return (
		<VStack mt='8' w='100%'>
			<AccordionRoot
				collapsible
				multiple
				defaultValue={filters.length > 0 ? [filters[0].key] : []}
			>
				{filters.map((filter) => {
					const selectedValues = searchParams.getAll(filter.key);
					const filterLabel = filter.key === 'brand' ? t('brand') : filter.name;

					return (
						<AccordionItem
							key={filter.id}
							mb='3'
							value={filter.key}
							borderBottomColor='border.light'
						>
							<AccordionItemTrigger>{filterLabel}</AccordionItemTrigger>
							<AccordionItemContent>
								<Fieldset.Root>
									<CheckboxGroup
										value={selectedValues}
										onValueChange={(values) => updateParams(filter.key, values as string[])}
										name={filter.key}
									>
										<Fieldset.Content colorPalette='gray' w='100%'>
											{filter.values.map((val) => (
												<Checkbox
													key={val.value}
													value={val.value}
													_hover={{ cursor: 'pointer' }}
												>
													{val.label}
												</Checkbox>
											))}
										</Fieldset.Content>
									</CheckboxGroup>
								</Fieldset.Root>
							</AccordionItemContent>
						</AccordionItem>
					);
				})}
			</AccordionRoot>
		</VStack>
	);
}
