'use client';
import { HStack, Tag, Wrap } from '@chakra-ui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useTrackedNavigation } from '@/hooks/useTrackedNavigation';
import { FILTER_TAG_EXCLUDED_KEYS } from '@/constants/products';
import type { Filter } from '@/types/product';
import { localizeUnit } from '@/utils/unitLocalization';
import { formatUsdPrice } from '@/utils/priceFormatting';
import { localizeAttributeName } from '@/utils/attributeLocalization';
import { useFilterTransition } from './FilterTransition';

// Active filters read as accent-tinted "chips" — the same accent border/bg
// treatment a checked row gets in the filters sidebar (QuickFilters.tsx,
// Filters.tsx) — so a tag here visually reads as "this came from a filter
// you set," and closing it maps back to unchecking that same control.
const chipStyle = {
	variant: 'solid' as const,
	size: 'lg' as const,
	fontWeight: 'medium',
	rounded: 'full',
	bg: 'bg.tertiary',
	color: 'main',
	transition: 'all .15s ease-in-out',
	px: '4',
	py: '1.5',
	borderWidth: '0.5px',
	borderStyle: 'solid' as const,
	borderColor: 'border',
	_hover: { cursor: 'pointer' as const, bg: 'bgHover.promoCard' },
};

type Props = {
	filters?: Filter[] | null;
};

export default function FiltersTags({ filters }: Props) {
	const searchParams = useSearchParams();
	const { push } = useTrackedNavigation();
	const { startTransition } = useFilterTransition();
	const t = useTranslations('products');
	const locale = useLocale();

	const minPrice = searchParams.get('min');
	const maxPrice = searchParams.get('max');
	const inStockFilter = searchParams.get('inStock');
	const orderByFilter = searchParams.get('orderBy');

	const isPriceRangeSet = minPrice && maxPrice;
	const toPriceTag = (value: string | null) => {
		if (!value) return null;
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) return value;
		return formatUsdPrice(parsed);
	};

	const clearParam = (key: string, value?: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value) {
			const values = params.getAll(key).filter((v) => v !== value);
			params.delete(key);
			values.forEach((v) => params.append(key, v));
		} else {
			params.delete(key);
		}

		startTransition(() => {
			push(`?${params.toString()}`);
		});
	};

	let orderBy = t('new');
	if (orderByFilter === 'expensive') orderBy = t('expensiveToCheap');
	if (orderByFilter === 'cheap') orderBy = t('cheapToExpensive');

	const dynamicFilters: { key: string; value: string }[] = [];
	searchParams.forEach((value, key) => {
		if (!FILTER_TAG_EXCLUDED_KEYS.includes(key)) {
			dynamicFilters.push({ key, value });
		}
	});

	const filterLabelByKey = new Map<string, string>();
	const valueLabelByKey = new Map<string, Map<string, string>>();
	const unitByKey = new Map<string, string | null>();
	(filters ?? []).forEach((filter) => {
		const baseLabel =
			filter.key === 'brand' ? t('brand') : localizeAttributeName(filter.name, locale);
		filterLabelByKey.set(filter.key, baseLabel);
		const labels = new Map<string, string>();
		filter.values.forEach((val) => labels.set(val.value, val.label));
		valueLabelByKey.set(filter.key, labels);
		unitByKey.set(filter.key, filter.key === 'brand' ? null : localizeUnit(filter.unit, locale));
	});

	const clearFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('min');
		params.delete('max');
		startTransition(() => {
			push(`?${params.toString()}`);
		});
	};

	return (
		<Wrap gap='4'>
			<HStack wrap='wrap' gap='3'>
				{isPriceRangeSet && (
					<Tag.Root {...chipStyle}>
						<Tag.Label>{`${toPriceTag(minPrice)} – ${toPriceTag(maxPrice)}`}</Tag.Label>
						<Tag.EndElement onClick={clearFilters}>
							<Tag.CloseTrigger cursor='pointer' aria-label={t('clearFilters')} />
						</Tag.EndElement>
					</Tag.Root>
				)}

				{inStockFilter && (
					<Tag.Root {...chipStyle}>
						<Tag.Label>
							{inStockFilter === 'true' ? t('productIsPresent') : t('productIsOutOfStock')}
						</Tag.Label>
						<Tag.EndElement onClick={() => clearParam('inStock')}>
							<Tag.CloseTrigger
								cursor='pointer'
								aria-label={t('clearFilters') + ' ' + t('inStock')}
							/>
						</Tag.EndElement>
					</Tag.Root>
				)}

				{orderByFilter && (
					<Tag.Root {...chipStyle}>
						<Tag.Label>{orderBy}</Tag.Label>
						<Tag.EndElement onClick={() => clearParam('orderBy')}>
							<Tag.CloseTrigger cursor='pointer' aria-label={t('clearFilters')} />
						</Tag.EndElement>
					</Tag.Root>
				)}

				{dynamicFilters.map(({ key, value }) => (
					<Tag.Root key={`${key}-${value}`} {...chipStyle}>
						<Tag.Label>
							{filterLabelByKey.get(key) ?? key}: {valueLabelByKey.get(key)?.get(value) ?? value}
							{unitByKey.get(key) ? ` ${unitByKey.get(key)}` : ''}
						</Tag.Label>
						<Tag.EndElement onClick={() => clearParam(key, value)}>
							<Tag.CloseTrigger
								cursor='pointer'
								aria-label={`${t('clearFilters')} ${key}: ${value}`}
							/>
						</Tag.EndElement>
					</Tag.Root>
				))}
			</HStack>
		</Wrap>
	);
}
