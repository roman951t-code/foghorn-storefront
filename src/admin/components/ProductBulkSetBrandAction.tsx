import { useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Select, Text } from '@adminjs/design-system';

const api = new ApiClient();

type Option = { id: string; label: string };

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

export default function ProductBulkSetBrandAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [options, setOptions] = useState<Option[]>([]);
	const [brandId, setBrandId] = useState('');
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!recordIds.length) return;
		setLoading(true);
		api.bulkAction({ resourceId: resource.id, recordIds, actionName: action.name, method: 'get' })
			.then((res) => setOptions(((res.data as any).payload?.options ?? []) as Option[]))
			.catch(() => setOptions([]))
			.finally(() => setLoading(false));
	}, [action.name, recordIds, resource.id]);

	const title = translateAction(action.name, resource.id);
	const hasOptions = options.length > 0;
	const canSave = !loading && hasOptions && brandId.trim().length > 0 && recordIds.length > 0;

	const handleSave = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('brandId', brandId);
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

			{loading ? (
				<Text color='grey60' mb='xl'>
					{translateMessage('product-bulk-options-loading')}
				</Text>
			) : hasOptions ? (
				<FormGroup>
					<Label>{translateMessage('product-bulk-brand')}</Label>
					<Select value={brandId} onChange={(e: any) => setBrandId(String(e?.target?.value ?? ''))}>
						<option value=''>{translateMessage('select-placeholder')}</option>
						{options.map((o) => (
							<option key={o.id} value={o.id}>
								{o.label}
							</option>
						))}
					</Select>
				</FormGroup>
			) : (
				<Text color='grey60' mb='xl'>
					{translateMessage('product-bulk-no-options')}
				</Text>
			)}

			{hasOptions ? (
				<Box mt='xl'>
					<Button
						variant='contained'
						color='primary'
						style={actionButtonStyle}
						disabled={!canSave || saving}
						onClick={handleSave}
					>
						{saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply')}
					</Button>
				</Box>
			) : null}
		</Box>
	);
}
