import { useEffect, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Badge, Box, Button, Icon, Label, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

type ActivityEntry = {
	id: string;
	type: 'FIELD_CHANGE' | 'NOTE';
	field: string | null;
	fromValue: string | null;
	toValue: string | null;
	note: string | null;
	adminEmail: string | null;
	createdAt: string;
};

const extractPayload = (payload: unknown): { entries: ActivityEntry[]; unavailable: boolean } => {
	if (!payload || typeof payload !== 'object') return { entries: [], unavailable: false };
	const entries = (payload as { entries?: ActivityEntry[] }).entries;
	const unavailable = Boolean((payload as { unavailable?: unknown }).unavailable);
	return { entries: Array.isArray(entries) ? entries : [], unavailable };
};

type Props = ActionProps & {
	actionNameOverride?: string;
	titleOverride?: string;
};

export default function ProductActivityTimeline(props: Props) {
	const { action, record, resource, actionNameOverride, titleOverride } = props;
	const recordId = record?.id;
	const actionName = actionNameOverride ?? action?.name ?? 'activityTimeline';
	const [entries, setEntries] = useState<ActivityEntry[]>([]);
	const [unavailable, setUnavailable] = useState(false);
	const [note, setNote] = useState('');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const addNotice = useNotice();
	const { translateAction, translateMessage, translateProperty } = useTranslation();
	const addNoticeRef = useRef(addNotice);

	useEffect(() => {
		addNoticeRef.current = addNotice;
	}, [addNotice]);

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName,
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				const extracted = extractPayload(response.data.payload);
				setEntries(extracted.entries);
				setUnavailable(extracted.unavailable);
			})
			.catch(() => {
				if (!isActive) return;
				addNoticeRef.current({ message: 'product-activity-load-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [actionName, recordId, resource.id]);

	const formatTimestamp = (value: string) => {
		const parsed = Date.parse(value);
		if (Number.isNaN(parsed)) return value;
		return new Date(parsed).toLocaleString();
	};

	const title =
		titleOverride ?? (action ? translateAction(action.name, resource.id) : translateMessage('product-activity-title'));

	const handleSubmit = async () => {
		if (!recordId) return;
		const trimmed = note.trim();
		if (!trimmed) {
			addNotice({ message: 'product-activity-note-empty', type: 'error' });
			return;
		}
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('note', trimmed);
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId,
				actionName,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) addNotice(response.data.notice);
			setNote('');
			const extracted = extractPayload(response.data.payload);
			setEntries(extracted.entries);
			setUnavailable(extracted.unavailable);
		} catch {
			addNotice({ message: 'product-activity-note-save-failed', type: 'error' });
		} finally {
			setSaving(false);
		}
	};

	if (!recordId) return null;

	const renderEntryTitle = (entry: ActivityEntry) => {
		if (entry.type === 'NOTE') return translateMessage('product-activity-note-entry');
		const fieldLabel = entry.field ? translateProperty(entry.field, resource.id) : translateMessage('product-activity-field-unknown');
		return translateMessage('product-activity-field-change', { field: fieldLabel });
	};

	const renderEntryBody = (entry: ActivityEntry) => {
		if (entry.type === 'NOTE') return entry.note ? <Text>{entry.note}</Text> : null;

		const fromValue = entry.fromValue ?? '-';
		const toValue = entry.toValue ?? '-';
		return (
			<Box display='flex' alignItems='center' style={{ gap: 8, flexWrap: 'wrap' }}>
				<Badge outline>{fromValue}</Badge>
				<Box display='flex' alignItems='center' style={{ color: '#718096' }}>
					<Icon icon='ChevronRight' size={18} />
				</Box>
				<Badge outline>{toValue}</Badge>
			</Box>
		);
	};

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
			</Box>

			<Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
				{unavailable ? (
					<Box style={{ border: '1px solid #FECACA', background: '#FEF2F2', padding: 12, borderRadius: 12 }}>
						<Text>{translateMessage('product-activity-unavailable')}</Text>
					</Box>
				) : null}
				<Box>
					<Label htmlFor='product-activity-note'>{translateMessage('product-activity-note-label')}</Label>
					<textarea
						id='product-activity-note'
						name='productActivityNote'
						value={note}
						disabled={isReadOnly}
						onChange={(event) => setNote(event.target.value)}
						placeholder={translateMessage('product-activity-note-placeholder')}
						rows={3}
						style={{
							width: '100%',
							resize: 'vertical',
							padding: '12px 14px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
							marginTop: 12,
						}}
					/>
				</Box>
				<Box>
					<Button
						style={{ borderColor: 'white', background: '#facc15', color: 'black' }}
						variant='contained'
						color='primary'
						onClick={handleSubmit}
						disabled={isReadOnly || saving}
					>
						{saving ? translateMessage('product-activity-note-saving') : translateMessage('product-activity-note-submit')}
					</Button>
				</Box>

				<Box>
					<Text fontSize='lg' fontWeight='bold' mb='md'>
						{translateMessage('product-activity-timeline')}
					</Text>
					{loading ? (
						<Text color='grey60'>{translateMessage('product-activity-load-progress')}</Text>
					) : entries.length === 0 ? (
						<Text color='grey60'>{translateMessage('product-activity-timeline-empty')}</Text>
					) : (
						<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
							{entries.map((entry) => {
								const adminLabel = entry.adminEmail ?? translateMessage('product-activity-unknown-admin');
								const timestamp = formatTimestamp(entry.createdAt);
								return (
									<Box
										key={entry.id}
										style={{
											border: '1px solid #E2E8F0',
											borderRadius: 12,
											padding: 16,
											background: '#F8FAFC',
										}}
									>
										<Box display='flex' alignItems='center' justifyContent='space-between' mb='sm'>
											<Text fontWeight='600'>{renderEntryTitle(entry)}</Text>
											<Text color='grey60' fontSize='15px'>
												{timestamp}
											</Text>
										</Box>
										{renderEntryBody(entry)}
										<Text color='grey60' fontSize='15px' mt='sm'>
											{translateMessage('product-activity-admin-label')}: {adminLabel}
										</Text>
									</Box>
								);
							})}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
