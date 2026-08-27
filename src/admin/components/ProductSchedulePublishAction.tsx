import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Label, Text } from '@adminjs/design-system';
import { isProductPublished } from '../../utils/publishSchedule';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

const toLocalInputValue = (value: string | null | undefined) => {
	if (!value) return '';
	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) return '';
	const d = new Date(parsed);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateTime = (value: string | null | undefined) => {
	if (!value) return '-';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return '-';
	return parsed.toLocaleString();
};

export default function ProductSchedulePublishAction({ action, record, resource }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage } = useTranslation();

	const productName = useMemo(() => String(record?.params?.name ?? ''), [record?.params?.name]);
	const productSlug = useMemo(() => String(record?.params?.slug ?? ''), [record?.params?.slug]);
	const productStatus = useMemo(() => String(record?.params?.status ?? ''), [record?.params?.status]);
	const productStatusLabel = useMemo(() => {
		if (!productStatus) return '';
		const translated = translateLabel(`status.${productStatus}`, resource.id);
		return translated && translated !== `status.${productStatus}` ? translated : productStatus;
	}, [productStatus, resource.id, translateLabel]);

	const initialStart = useMemo(
		() => toLocalInputValue((record?.params?.publishStartAt as string | undefined) ?? null),
		[record?.params?.publishStartAt]
	);
	const initialEnd = useMemo(
		() => toLocalInputValue((record?.params?.publishEndAt as string | undefined) ?? null),
		[record?.params?.publishEndAt]
	);

	const [publishStartAt, setPublishStartAt] = useState(initialStart);
	const [publishEndAt, setPublishEndAt] = useState(initialEnd);
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const title = translateAction(action.name, resource.id);

	const clientValidationError = useMemo(() => {
		if (publishStartAt && publishEndAt) {
			const start = new Date(publishStartAt);
			const end = new Date(publishEndAt);
			if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() >= end.getTime()) {
				return translateMessage('publish-window-invalid');
			}
		}
		return null;
	}, [publishEndAt, publishStartAt, translateMessage]);

	const currentSummary = useMemo(() => {
		const start = (record?.params?.publishStartAt as string | undefined) ?? null;
		const end = (record?.params?.publishEndAt as string | undefined) ?? null;
		if (!start && !end) return translateMessage('publish-schedule-none');
		if (start && end) {
			return translateMessage('publish-schedule-window', {
				start: formatDateTime(start),
				end: formatDateTime(end),
			});
		}
		if (start) {
			return translateMessage('publish-schedule-start', { start: formatDateTime(start) });
		}
		return translateMessage('publish-schedule-end', { end: formatDateTime(end) });
	}, [record?.params?.publishEndAt, record?.params?.publishStartAt, translateMessage]);

	const visibleNow = useMemo(() => {
		const start = record?.params?.publishStartAt ? new Date(String(record?.params?.publishStartAt)) : null;
		const end = record?.params?.publishEndAt ? new Date(String(record?.params?.publishEndAt)) : null;
		return isProductPublished(productStatus, start, end);
	}, [productStatus, record?.params?.publishEndAt, record?.params?.publishStartAt]);

	const handleSave = async () => {
		if (!record?.id || saving) return;
		if (clientValidationError) {
			addNotice({ message: 'publish-window-invalid', type: 'error' });
			return;
		}
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('publishStartAt', publishStartAt ? new Date(publishStartAt).toISOString() : '');
			formData.append('publishEndAt', publishEndAt ? new Date(publishEndAt).toISOString() : '');

			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: record.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});

			if (response.data.notice) addNotice(response.data.notice);
		} catch {
			addNotice({ message: 'publish-schedule-failed', type: 'error' });
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
			maxWidth='720px'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Text fontSize='xl' fontWeight='bold' mb='md'>
				{title}
			</Text>
			{productName ? (
				<Box mb='lg'>
					<Text fontWeight='bold'>{productName}</Text>
					<Text color='grey60'>
						{productSlug ? `${productSlug}` : null}
						{productStatus ? `${productSlug ? ' • ' : ''}${productStatusLabel}` : null}
					</Text>
				</Box>
			) : null}

			<Text mb='sm'>{currentSummary}</Text>
			<Text color='grey60' mb='xl'>
				{translateMessage('publish-visibility-now')}: {visibleNow ? translateMessage('publish-visibility-yes') : translateMessage('publish-visibility-no')}
			</Text>

			<Box style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
				<Box>
					<Label htmlFor='publishStartAt'>{translateMessage('publish-start')}</Label>
					<input
						id='publishStartAt'
						type='datetime-local'
						value={publishStartAt}
						disabled={isReadOnly}
						onChange={(e) => setPublishStartAt(e.target.value)}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							marginTop: 10,
							fontSize: 15,
						}}
					/>
				</Box>

				<Box>
					<Label htmlFor='publishEndAt'>{translateMessage('publish-end')}</Label>
					<input
						id='publishEndAt'
						type='datetime-local'
						value={publishEndAt}
						disabled={isReadOnly}
						onChange={(e) => setPublishEndAt(e.target.value)}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							marginTop: 10,
							fontSize: 15,
						}}
					/>
				</Box>
			</Box>

			{clientValidationError ? (
				<Text color='red60' mt='lg'>
					{clientValidationError}
				</Text>
			) : null}

			<Box mt='xl'>
				<Button
					style={{ borderColor: 'white', background: '#facc15', color: 'black' }}
					variant='contained'
					color='primary'
					onClick={handleSave}
					disabled={isReadOnly || saving}
				>
					{saving ? translateMessage('publish-schedule-saving') : translateMessage('publish-schedule-save')}
				</Button>
			</Box>
		</Box>
	);
}
