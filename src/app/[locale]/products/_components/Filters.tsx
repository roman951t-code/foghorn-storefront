'use client';

import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { Checkbox } from '@/components/ui/chakra/checkbox';
import { Filter } from '@/types/product';
import CountPill from '@/components/ui/CountPill';
import { Box, CheckboxGroup, Fieldset, HStack, Text } from '@chakra-ui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useTrackedNavigation } from '@/hooks/useTrackedNavigation';
import { localizeUnit } from '@/utils/unitLocalization';
import { localizeAttributeName } from '@/utils/attributeLocalization';

type Props = {
	filters: Filter[] | null;
};

export default function Filters({ filters }: Props) {
	const { push } = useTrackedNavigation();
	const searchParams = useSearchParams();
	const t = useTranslations('products');
	const locale = useLocale();

	const updateParams = useCallback(
		(key: string, values: string[]) => {
			const params = new URLSearchParams(searchParams.toString());

			params.delete(key);

			values.forEach((value) => params.append(key, value));

			push(`?${params.toString()}`, { scroll: false });
		},
		[push, searchParams],
	);

	if (!filters || filters.length === 0) {
		return null;
	}

	return (
		<Box mt={6} w='100%' minW={0}>
			<AccordionRoot
				collapsible
				multiple
				defaultValue={filters.length > 0 ? [filters[0].key] : []}
				w='100%'
			>
				{filters.map((filter) => {
					const selectedValues = searchParams.getAll(filter.key);
					const filterLabel =
						filter.key === 'brand' ? t('brand') : localizeAttributeName(filter.name, locale);
					const localizedUnit = filter.key === 'brand' ? null : localizeUnit(filter.unit, locale);
					const filterLabelWithUnit = localizedUnit
						? `${filterLabel} (${localizedUnit})`
						: filterLabel;
					const selectedCount = selectedValues.length;

					return (
						<AccordionItem
							key={filter.id}
							mb={3}
							value={filter.key}
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							rounded='lg'
							overflow='hidden'
							bg='bg.tertiary'
						>
							<AccordionItemTrigger
								px={4}
								py={3}
								bg='bg.tertiary'
								fontWeight='semibold'
								fontSize={{ base: 'md', md: 'sm' }}
								transition='all 0.15s ease-in-out'
								_hover={{ bg: 'bgHover.promoCard' }}
							>
								<HStack justify='space-between' w='full' minW={0}>
									<Text lineClamp={1} fontSize={{ base: 'md', md: 'sm' }}>
										{filterLabelWithUnit}
									</Text>
									{selectedCount > 0 ? (
										<CountPill
											value={selectedCount}
											labelProps={{ fontSize: { base: 'md', md: 'sm' } }}
										/>
									) : null}
								</HStack>
							</AccordionItemTrigger>
							<AccordionItemContent px={4} pb={4}>
								<Fieldset.Root>
									<CheckboxGroup
										value={selectedValues}
										onValueChange={(values) => updateParams(filter.key, values as string[])}
										name={filter.key}
									>
										<Fieldset.Content colorPalette='gray' w='100%' gap={2}>
											{filter.values.map((val) => (
												<Checkbox
													key={val.value}
													value={val.value}
													w='100%'
													minW={0}
													px={3}
													py={2}
													rounded='lg'
													borderWidth='0.5px'
													borderStyle='solid'
													borderColor='border'
													transition='all 0.15s ease-in-out'
													_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
													fontSize={{ base: 'md', md: 'sm' }}
													whiteSpace='normal'
													wordBreak='break-word'
												>
													{localizedUnit ? `${val.label} ${localizedUnit}` : val.label}
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
		</Box>
	);
}
