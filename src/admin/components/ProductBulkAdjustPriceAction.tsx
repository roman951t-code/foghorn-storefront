import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Select, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();
type PriceDirection = 'increase' | 'decrease';
type PriceKind = 'percent' | 'fixed';
type PriceDirectionOption = { value: PriceDirection; label: string };
type PriceKindOption = { value: PriceKind; label: string };

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

export default function ProductBulkAdjustPriceAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [direction, setDirection] = useState<PriceDirection>('increase');
	const [kind, setKind] = useState<PriceKind>('percent');
	const [value, setValue] = useState('10');
	const [applyToDiscount, setApplyToDiscount] = useState(false);
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const title = translateAction(action.name, resource.id);
	const directionOptions = useMemo<PriceDirectionOption[]>(
		() => [
			{ value: 'increase', label: translateMessage('product-bulk-price-increase') },
			{ value: 'decrease', label: translateMessage('product-bulk-price-decrease') },
		],
		[translateMessage]
	);
	const kindOptions = useMemo<PriceKindOption[]>(
		() => [
			{ value: 'percent', label: translateMessage('product-bulk-price-percent') },
			{ value: 'fixed', label: translateMessage('product-bulk-price-fixed') },
		],
		[translateMessage]
	);
	const selectedDirectionOption =
		directionOptions.find((option) => option.value === direction) ?? directionOptions[0] ?? null;
	const selectedKindOption = kindOptions.find((option) => option.value === kind) ?? kindOptions[0] ?? null;
	const parsedValue = Number(value);
	const canSave = recordIds.length > 0 && Number.isFinite(parsedValue) && parsedValue > 0;

	const handleSave = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('direction', direction);
			formData.append('kind', kind);
			formData.append('value', value);
			formData.append('applyToDiscount', String(applyToDiscount));
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

			<Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
				<FormGroup>
					<Label>{translateMessage('product-bulk-price-direction')}</Label>
					<Select
						options={directionOptions}
						value={selectedDirectionOption}
						isClearable={false}
						isDisabled={isReadOnly}
						onChange={(option: PriceDirectionOption | null) => setDirection(option?.value ?? 'increase')}
					/>
				</FormGroup>
				<FormGroup>
					<Label>{translateMessage('product-bulk-price-kind')}</Label>
					<Select
						options={kindOptions}
						value={selectedKindOption}
						isClearable={false}
						isDisabled={isReadOnly}
						onChange={(option: PriceKindOption | null) => setKind(option?.value ?? 'percent')}
					/>
				</FormGroup>
				<FormGroup>
					<Label>{translateMessage('product-bulk-price-value')}</Label>
					<input
						type='number'
						step='0.01'
						value={value}
						disabled={isReadOnly}
						onChange={(e) => setValue(e.target.value)}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
						}}
					/>
				</FormGroup>
			</Box>

			<Box mt='lg'>
				<label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
					<input
						type='checkbox'
						checked={applyToDiscount}
						disabled={isReadOnly}
						onChange={(e) => setApplyToDiscount(e.target.checked)}
					/>
					<Text>{translateMessage('product-bulk-price-apply-discount')}</Text>
				</label>
			</Box>

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
