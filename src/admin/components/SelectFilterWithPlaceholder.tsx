import type { FilterPropertyProps } from 'adminjs';
import { useTranslation } from 'adminjs';
import { FormGroup, Label, Select } from '@adminjs/design-system';

type SelectOption = { value: string | number; label: string };

export default function SelectFilterWithPlaceholder(props: FilterPropertyProps) {
	const { property, filter, onChange } = props;
	const { tl, translateMessage, translateProperty } = useTranslation();

	const availableValues = property.availableValues ?? [];
	const options: SelectOption[] = availableValues.map((option) => ({
		value: option.value,
		label: tl(`${property.path}.${option.value}`, property.resourceId, {
			defaultValue: option.label ?? String(option.value),
		}),
	}));

	const currentValue = filter[property.path] ?? '';
	const selected =
		options.find((option) => String(option.value) === String(currentValue)) ?? null;

	return (
		<FormGroup variant='filter'>
			<Label>{translateProperty(property.label, property.resourceId)}</Label>
			<Select
				variant='filter'
				isClearable
				placeholder={translateMessage('select-placeholder', { defaultValue: 'Select...' })}
				options={options}
				value={selected}
				onChange={(option: SelectOption | null) => {
					const value = option ? option.value : '';
					onChange(property.path, value);
				}}
			/>
		</FormGroup>
	);
}
