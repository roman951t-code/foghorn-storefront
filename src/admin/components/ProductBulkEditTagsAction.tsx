import { useMemo, useState } from 'react';
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

export default function ProductBulkEditTagsAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [mode, setMode] = useState<'add' | 'remove' | 'replace'>('add');
	const [tags, setTags] = useState('');
	const [saving, setSaving] = useState(false);

	const title = translateAction(action.name, resource.id);
	const canSave = recordIds.length > 0 && tags.trim().length > 0;

	const handleSave = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('mode', mode);
			formData.append('tags', tags);
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
				<Label>{translateMessage('product-bulk-tags-mode')}</Label>
				<Select value={mode} onChange={(e: any) => setMode(String(e?.target?.value ?? 'add') as any)}>
					<option value='add'>{translateMessage('product-bulk-tags-add')}</option>
					<option value='remove'>{translateMessage('product-bulk-tags-remove')}</option>
					<option value='replace'>{translateMessage('product-bulk-tags-replace')}</option>
				</Select>
			</FormGroup>

			<FormGroup>
				<Label>{translateMessage('product-bulk-tags')}</Label>
				<input
					value={tags}
					onChange={(e) => setTags(e.target.value)}
					placeholder='popular,new'
					style={{
						width: '100%',
						padding: '10px 12px',
						borderRadius: 8,
						border: '1px solid #E2E8F0',
						fontSize: 14,
					}}
				/>
				<Text color='grey60' mt='default'>
					{translateMessage('product-bulk-tags-hint')}
				</Text>
			</FormGroup>

			<Box mt='xl'>
				<Button variant='contained' color='primary' style={actionButtonStyle} disabled={!canSave || saving} onClick={handleSave}>
					{saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply')}
				</Button>
			</Box>
		</Box>
	);
}
