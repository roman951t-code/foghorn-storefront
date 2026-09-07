import { useEffect, useState, type ChangeEvent } from 'react';
import type { EditPropertyProps } from 'adminjs';
import { FormGroup, Input, Label } from '@adminjs/design-system';
import { useTranslation } from 'adminjs';

const parseNumber = (value: string): number | null => {
	const normalized = value.trim();
	if (!normalized) return null;
	const numeric = Number(normalized);
	return Number.isFinite(numeric) ? numeric : null;
};

const buildFilterJson = (min: string, max: string): string => {
	const minValue = parseNumber(min);
	const maxValue = parseNumber(max);
	if (minValue === null && maxValue === null) return '';
	if (minValue !== null && maxValue !== null) return JSON.stringify({ gte: minValue, lte: maxValue });
	if (minValue !== null) return JSON.stringify({ gte: minValue });
	return JSON.stringify({ lte: maxValue });
};

export default function OrderTotalRangeFilter(props: EditPropertyProps) {
	const { onChange, property, filter } = props;
	const { translateProperty } = useTranslation();
	const filterValue = filter[property.path] as string | undefined;

	const [min, setMin] = useState('');
	const [max, setMax] = useState('');

	useEffect(() => {
		if (!filterValue) {
			setMin('');
			setMax('');
			return;
		}
		try {
			const parsed = JSON.parse(filterValue) as unknown;
			if (parsed && typeof parsed === 'object') {
				const obj = parsed as { gte?: unknown; lte?: unknown };
				setMin(typeof obj.gte === 'number' ? String(obj.gte) : '');
				setMax(typeof obj.lte === 'number' ? String(obj.lte) : '');
			} else if (typeof parsed === 'number') {
				setMin(String(parsed));
				setMax('');
			}
		} catch {
			// ignore
		}
	}, [filterValue]);

	return (
		<FormGroup variant='filter'>
			<Label>{translateProperty(property.label, property.resourceId)}</Label>
			<Input
				name={`filter-${property.path}-min`}
				type='number'
				inputMode='decimal'
				placeholder={translateProperty('from')}
				value={min}
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					const next = e.target.value;
					setMin(next);
					onChange(property.path, buildFilterJson(next, max));
				}}
			/>
			<Input
				name={`filter-${property.path}-max`}
				type='number'
				inputMode='decimal'
				placeholder={translateProperty('to')}
				value={max}
				mt='default'
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					const next = e.target.value;
					setMax(next);
					onChange(property.path, buildFilterJson(min, next));
				}}
			/>
		</FormGroup>
	);
}
