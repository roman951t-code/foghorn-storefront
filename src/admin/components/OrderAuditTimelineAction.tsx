import { useEffect, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Badge, Box, Button, Icon, Label, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

type AuditEntry = {
	id: string;
	type: 'STATUS_CHANGE' | 'NOTE';
	fromStatus: OrderStatus | null;
	toStatus: OrderStatus | null;
	note: string | null;
	adminEmail: string | null;
	createdAt: string;
};

const extractEntries = (payload: unknown): AuditEntry[] => {
	if (!payload || typeof payload !== 'object') return [];
	const entries = (payload as { entries?: AuditEntry[] }).entries;
	return Array.isArray(entries) ? entries : [];
};

export default function OrderAuditTimelineAction({ action, record, resource }: ActionProps) {
	const [entries, setEntries] = useState<AuditEntry[]>([]);
	const [note, setNote] = useState('');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage } = useTranslation();
	const recordId = record?.id;
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
			actionName: action.name,
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				const payloadEntries = extractEntries(response.data.payload);
				setEntries(payloadEntries);
			})
			.catch(() => {
				if (!isActive) return;
				addNoticeRef.current({ message: 'audit-load-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [action.name, recordId, resource.id]);

	if (!recordId) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('audit-load-failed')}</Text>
			</Box>
		);
	}

	const title = translateAction(action.name, resource.id);
	const formatTimestamp = (value: string) => {
		const parsed = Date.parse(value);
		if (Number.isNaN(parsed)) {
			return value;
		}
		return new Date(parsed).toLocaleString();
	};

	const handleSubmit = async () => {
		if (!recordId) return;
		const trimmed = note.trim();
		if (!trimmed) {
			addNotice({ message: 'audit-note-empty', type: 'error' });
			return;
		}
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('note', trimmed);
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			setNote('');
			const payloadEntries = extractEntries(response.data.payload);
			setEntries(payloadEntries);
		} catch {
			addNotice({ message: 'audit-note-save-failed', type: 'error' });
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box
			variant='white'
			p='xxl'
			borderRadius='xl'
			boxShadow='sm'
			maxWidth='820px'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
			</Box>
			<Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
				<Box>
					<Label htmlFor='audit-note'>{translateMessage('audit-note-label')}</Label>
					<textarea
						id='audit-note'
						name='auditNote'
						value={note}
						disabled={isReadOnly}
						onChange={(event) => setNote(event.target.value)}
						placeholder={translateMessage('audit-note-placeholder')}
						rows={4}
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
						style={{
							borderColor: 'white',
							background: '#facc15',
							color: 'black',
						}}
						variant='contained'
						color='primary'
						onClick={handleSubmit}
						disabled={isReadOnly || saving}
					>
						{saving ? translateMessage('audit-note-saving') : translateMessage('audit-note-submit')}
					</Button>
				</Box>
				<Box>
					<Text fontSize='lg' fontWeight='bold' mb='md'>
						{translateMessage('audit-timeline')}
					</Text>
					{loading ? (
						<Text color='grey60'>{translateMessage('audit-load-progress')}</Text>
					) : entries.length === 0 ? (
						<Text color='grey60'>{translateMessage('audit-timeline-empty')}</Text>
					) : (
						<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
							{entries.map((entry) => {
								const adminLabel = entry.adminEmail ?? translateMessage('audit-unknown-admin');
								const timestamp = formatTimestamp(entry.createdAt);
								const fromLabel = entry.fromStatus
									? translateLabel(`status.${entry.fromStatus}`, resource.id)
									: translateMessage('status-unknown');
								const toLabel = entry.toStatus
									? translateLabel(`status.${entry.toStatus}`, resource.id)
									: translateMessage('status-unknown');
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
											<Text fontWeight='600'>
												{entry.type === 'NOTE'
													? translateMessage('audit-note-entry')
													: translateMessage('audit-status-change', {
															from: fromLabel,
															to: toLabel,
													  })}
											</Text>
											<Text color='grey60' fontSize='15px'>
												{timestamp}
											</Text>
										</Box>
										{entry.type === 'STATUS_CHANGE' ? (
											<Box display='flex' alignItems='center' style={{ gap: 8 }}>
												<Badge outline>{fromLabel}</Badge>
												<Box display='flex' alignItems='center' style={{ color: '#718096' }}>
													<Icon icon='ChevronRight' size={18} />
												</Box>
												<Badge outline>{toLabel}</Badge>
											</Box>
										) : entry.note ? (
											<Text>{entry.note}</Text>
										) : null}
										<Text color='grey60' fontSize='15px' mt='sm'>
											{translateMessage('audit-admin-label')}: {adminLabel}
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
