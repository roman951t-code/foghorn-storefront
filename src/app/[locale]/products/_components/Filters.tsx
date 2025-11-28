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
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
	filters: Filter[] | null;
};

export default function Filters({ filters }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();

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
				defaultValue={filters.length > 0 ? [filters[0].name] : []}
			>
				{filters.map((filter) => {
					const selectedValues = searchParams.getAll(filter.name);

					return (
						<AccordionItem
							key={filter.id}
							mb='3'
							value={filter.name}
							borderBottomColor='border.light'
						>
							<AccordionItemTrigger>{filter.name}</AccordionItemTrigger>
							<AccordionItemContent>
								<Fieldset.Root>
									<CheckboxGroup
										value={selectedValues}
										onValueChange={(values) => updateParams(filter.name, values as string[])}
										name={filter.name}
									>
										<Fieldset.Content colorPalette='gray' w='100%'>
											{filter.values.map((val) => (
												<Checkbox key={val} value={val} _hover={{ cursor: 'pointer' }}>
													{val}
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
