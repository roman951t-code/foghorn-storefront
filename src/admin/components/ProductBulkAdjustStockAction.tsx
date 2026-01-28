import { useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Select, Text } from '@adminjs/design-system';

const api = new ApiClient();

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

type Mode = 'set' | 'increase' | 'decrease';

export default function ProductBulkAdjustStockAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [mode, setMode] = useState<Mode>('set');
	const [value, setValue] = useState('');
	const [syncInStock, setSyncInStock] = useState(true);
	const [reason, setReason] = useState('');
	const [saving, setSaving] = useState(false);

	const title = translateAction(action.name, resource.id);
	const parsedValue = value.trim() === '' ? NaN : Number(value);
	const isInteger = Number.isFinite(parsedValue) && Number.isInteger(parsedValue);
	const isValidValue = isInteger && parsedValue >= 0 && (mode === 'set' ? true : parsedValue > 0);
	const canSave = recordIds.length > 0 && isValidValue;
	const translateWithFallback = (key: string, fallback: string) => {
		const translated = translateMessage(key);
		return translated && translated !== key ? translated : fallback;
	};

	const initialValue = useMemo(() => {
		const source = records ?? [];
		if (!source.length) return '';
		const values = source
			.map((record) => {
				const raw = (record as any)?.params?.stock;
				const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
				return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
			})
			.filter((val) => val !== null) as number[];
		if (!values.length || values.length !== source.length) return '';
		const first = values[0];
		if (!values.every((val) => val === first)) return '';
		return String(first);
	}, [records]);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	const handleSave = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('mode', mode);
			formData.append('value', value);
			formData.append('syncInStock', String(syncInStock));
			formData.append('reason', reason);
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
				<Label>{translateWithFallback('product-bulk-stock-adjust-mode', 'Mode')}</Label>
				<Select value={mode} onChange={(e: any) => setMode(String(e?.target?.value ?? 'set') as Mode)}>
					<option value='set'>{translateWithFallback('product-bulk-stock-adjust-set', 'Set stock (reconcile)')}</option>
					<option value='increase'>
						{translateWithFallback('product-bulk-stock-adjust-increase', 'Increase stock')}
					</option>
					<option value='decrease'>
						{translateWithFallback('product-bulk-stock-adjust-decrease', 'Decrease stock')}
					</option>
				</Select>
			</FormGroup>

			<FormGroup>
				<Label>{translateWithFallback('product-bulk-stock-adjust-value', 'Quantity')}</Label>
				<input
					type='number'
					step='1'
					min='0'
					value={value}
					onChange={(e) => setValue(e.target.value)}
					style={{
						width: '100%',
						padding: '10px 12px',
						borderRadius: 8,
						border: '1px solid #E2E8F0',
						fontSize: 14,
					}}
				/>
			</FormGroup>

			<FormGroup>
				<Label>{translateWithFallback('product-bulk-stock-adjust-reason', 'Reason for adjustment')}</Label>
				<textarea
					rows={3}
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder={translateWithFallback(
						'product-bulk-stock-adjust-reason-placeholder',
						'Explain why stock is being adjusted'
					)}
					style={{
						width: '100%',
						resize: 'vertical',
						padding: '10px 12px',
						borderRadius: 8,
						border: '1px solid #E2E8F0',
						fontSize: 14,
					}}
				/>
			</FormGroup>

			<Box mt='lg'>
				<label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
					<input type='checkbox' checked={syncInStock} onChange={(e) => setSyncInStock(e.target.checked)} />
					<Text>
						{translateWithFallback('product-bulk-stock-adjust-sync', 'Also update inStock based on resulting stock')}
					</Text>
				</label>
			</Box>

			<Box mt='xl'>
				<Button variant='contained' color='primary' style={actionButtonStyle} disabled={!canSave || saving} onClick={handleSave}>
					{saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply')}
				</Button>
			</Box>
		</Box>
	);
}
