import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { flat, type EditPropertyProps } from 'adminjs';
import { FormGroup, Input, Label } from '@adminjs/design-system';
import { useTranslation } from 'adminjs';

const parseCsvTags = (value: string): string[] => {
	const parsed = value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean)
		.map((tag) => tag.toLowerCase());
	return Array.from(new Set(parsed));
};

const toCsv = (value: unknown): string => {
	if (!value) return '';
	if (Array.isArray(value))
		return value
			.map((v) => String(v))
			.filter(Boolean)
			.join(', ');
	if (typeof value === 'string') return value;
	return '';
};

export default function ProductTagsEdit(props: EditPropertyProps) {
	const { property, record, onChange } = props;
	const { translateProperty } = useTranslation();

	const value = useMemo(
		() => flat.get(record.params, property.path),
		[record.params, property.path]
	);
	const initial = useMemo(() => toCsv(value), [value]);
	const [text, setText] = useState(initial);

	useEffect(() => {
		setText(initial);
	}, [initial]);

	useEffect(() => {
		if (record.id) return;
		if (value === undefined) onChange(property.path, []);
	}, [onChange, property.path, record.id, value]);

	return (
		<FormGroup mb='xl'>
			<Label>{translateProperty(property.label, property.resourceId)}</Label>
			<Input
				name={property.path}
				placeholder='popular, discount'
				value={text}
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					const nextText = e.target.value;
					setText(nextText);
					onChange(property.path, parseCsvTags(nextText));
				}}
			/>
		</FormGroup>
	);
}
