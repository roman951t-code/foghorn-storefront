import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Select, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

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

export default function ProductBulkToggleInStockAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [mode, setMode] = useState<'toggle' | 'set'>('toggle');
	const [value, setValue] = useState<'true' | 'false'>('true');
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const title = translateAction(action.name, resource.id);
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
					value={mode}
					disabled={isReadOnly}
					onChange={(e: any) => setMode(String(e?.target?.value ?? 'toggle') as any)}
				>
					<option value='toggle'>{translateMessage('product-bulk-stock-toggle')}</option>
					<option value='set'>{translateMessage('product-bulk-stock-set')}</option>
				</Select>
			</FormGroup>

			{mode === 'set' ? (
				<FormGroup>
					<Label>{translateMessage('product-bulk-stock-value')}</Label>
					<Select
						value={value}
						disabled={isReadOnly}
						onChange={(e: any) => setValue(String(e?.target?.value ?? 'true') as any)}
					>
						<option value='true'>{translateLabel('inStock.true', resource.id)}</option>
						<option value='false'>{translateLabel('inStock.false', resource.id)}</option>
					</Select>
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
