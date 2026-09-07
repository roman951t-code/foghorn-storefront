import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Select, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();
type ToggleMode = 'toggle' | 'set';
type InStockValue = 'true' | 'false';
type ToggleModeOption = { value: ToggleMode; label: string };
type InStockValueOption = { value: InStockValue; label: string };

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const resolveRecordIds = (records: ActionProps['records']) => {
	const fromProps = (records ?? []).map((r) => r.id).filter(Boolean) as string[];
	if (fromProps.length) return fromProps;
	if (typeof window === 'undefined') return [];
	const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	return raw
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
};

export default function ProductBulkToggleInStockAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [mode, setMode] = useState<ToggleMode>('toggle');
	const [value, setValue] = useState<InStockValue>('true');
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const title = translateAction(action.name, resource.id);
	const modeOptions = useMemo<ToggleModeOption[]>(
		() => [
			{ value: 'toggle', label: translateMessage('product-bulk-stock-toggle') },
			{ value: 'set', label: translateMessage('product-bulk-stock-set') },
		],
		[translateMessage]
	);
	const valueOptions = useMemo<InStockValueOption[]>(
		() => [
			{ value: 'true', label: translateLabel('inStock.true', resource.id) },
			{ value: 'false', label: translateLabel('inStock.false', resource.id) },
		],
		[resource.id, translateLabel]
	);
	const selectedModeOption = modeOptions.find((option) => option.value === mode) ?? modeOptions[0] ?? null;
	const selectedValueOption = valueOptions.find((option) => option.value === value) ?? valueOptions[0] ?? null;
	const canSave = recordIds.length > 0;

	const handleSave = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('mode', mode);
			formData.append('value', value);
			const response = await api.bulkAction({
				resourceId: resource.id,
				recordIds,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) addNotice(response.data.notice);
		} catch {
			addNotice({ message: 'product-bulk-failed', type: 'error' });
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Text fontSize='xl' fontWeight='bold' mb='md'>
				{title}
			</Text>
			<Text color='grey60' mb='xl'>
				{translateMessage('product-bulk-selected', { count: recordIds.length })}
			</Text>

			<FormGroup>
				<Label>{translateMessage('product-bulk-stock-mode')}</Label>
				<Select
					options={modeOptions}
					value={selectedModeOption}
					isClearable={false}
					isDisabled={isReadOnly}
					onChange={(option: ToggleModeOption | null) => setMode(option?.value ?? 'toggle')}
				/>
			</FormGroup>

			{mode === 'set' ? (
				<FormGroup>
					<Label>{translateMessage('product-bulk-stock-value')}</Label>
					<Select
						options={valueOptions}
						value={selectedValueOption}
						isClearable={false}
						isDisabled={isReadOnly}
						onChange={(option: InStockValueOption | null) => setValue(option?.value ?? 'true')}
					/>
				</FormGroup>
			) : null}

			<Box mt='xl'>
				<Button
					variant='contained'
					color='primary'
					style={actionButtonStyle}
					disabled={isReadOnly || !canSave || saving}
					onClick={handleSave}
				>
					{saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply')}
				</Button>
			</Box>
		</Box>
	);
}
