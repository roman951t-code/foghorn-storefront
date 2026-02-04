import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Text } from '@adminjs/design-system';
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

const formatMoney = (value: number, currency = 'UAH') => {
	const safeValue = Number.isFinite(value) ? value : 0;
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(safeValue);
	} catch {
		return safeValue.toFixed(2);
	}
};

export default function ProductScheduleDiscountAction({ action, record, resource }: ActionProps) {
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
	const basePrice = useMemo(() => Number(record?.params?.basePrice ?? 0), [record?.params?.basePrice]);
	const initialDiscountPrice = useMemo(
		() => (record?.params?.discountPrice != null ? String(record?.params?.discountPrice) : ''),
		[record?.params?.discountPrice]
	);
	const initialStart = useMemo(
		() => toLocalInputValue((record?.params?.discountStartAt as string | undefined) ?? null),
		[record?.params?.discountStartAt]
	);
	const initialEnd = useMemo(
		() => toLocalInputValue((record?.params?.discountEndAt as string | undefined) ?? null),
		[record?.params?.discountEndAt]
	);

	const [discountPrice, setDiscountPrice] = useState(initialDiscountPrice);
	const [discountStartAt, setDiscountStartAt] = useState(initialStart);
	const [discountEndAt, setDiscountEndAt] = useState(initialEnd);
	const [saving, setSaving] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const title = translateAction(action.name, resource.id);

	const clientValidationError = useMemo(() => {
		const hasWindow = Boolean(discountStartAt || discountEndAt);
		if (hasWindow && (!discountStartAt || !discountEndAt)) {
			return translateMessage('discount-window-invalid');
		}
		if (discountStartAt && discountEndAt) {
			const start = new Date(discountStartAt);
			const end = new Date(discountEndAt);
			if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() >= end.getTime()) {
				return translateMessage('discount-window-invalid');
			}
		}
		if (hasWindow && !discountPrice.trim()) {
			return translateMessage('discount-price-required');
		}
		if (discountPrice.trim()) {
			const parsed = Number(discountPrice);
			if (!Number.isFinite(parsed) || !(parsed > 0) || !(parsed < basePrice)) {
				return translateMessage('discount-price-invalid');
			}
		}
		return null;
	}, [basePrice, discountEndAt, discountPrice, discountStartAt, translateMessage]);

	const currentSummary = useMemo(() => {
		const dp = record?.params?.discountPrice != null ? Number(record?.params?.discountPrice) : null;
		if (!dp) return translateMessage('discount-none');
		const start = (record?.params?.discountStartAt as string | undefined) ?? null;
		const end = (record?.params?.discountEndAt as string | undefined) ?? null;
		if (!start && !end) return translateMessage('discount-always', { price: formatMoney(dp) });
		return translateMessage('discount-window', {
			price: formatMoney(dp),
			start: start ? new Date(start).toLocaleString() : '-',
			end: end ? new Date(end).toLocaleString() : '-',
		});
	}, [record?.params?.discountEndAt, record?.params?.discountPrice, record?.params?.discountStartAt, translateMessage]);

	const handleSave = async () => {
		if (!record?.id || saving) return;
		if (clientValidationError) {
			addNotice({ message: 'discount-window-invalid', type: 'error' });
			return;
		}
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('discountPrice', discountPrice);
			formData.append('discountStartAt', discountStartAt ? new Date(discountStartAt).toISOString() : '');
			formData.append('discountEndAt', discountEndAt ? new Date(discountEndAt).toISOString() : '');

			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: record.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});

			if (response.data.notice) addNotice(response.data.notice);
		} catch {
			addNotice({ message: 'discount-schedule-failed', type: 'error' });
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
			<Text color='grey60' mb='lg'>
				{translateMessage('discount-base-price')}: {formatMoney(basePrice)}
			</Text>
			<Text mb='xl'>{currentSummary}</Text>

			<Box style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
				<FormGroup label={translateMessage('discount-price-label')} mb='0'>
					<input
						type='number'
						step='0.01'
						value={discountPrice}
						disabled={isReadOnly}
						onChange={(e) => setDiscountPrice(e.target.value)}
						placeholder='0.00'
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 14,
						}}
					/>
				</FormGroup>

				<Box>
					<Label htmlFor='discountStartAt'>{translateMessage('discount-start')}</Label>
					<input
						id='discountStartAt'
						type='datetime-local'
						value={discountStartAt}
						disabled={isReadOnly}
						onChange={(e) => setDiscountStartAt(e.target.value)}
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
					<Label htmlFor='discountEndAt'>{translateMessage('discount-end')}</Label>
					<input
						id='discountEndAt'
						type='datetime-local'
						value={discountEndAt}
						disabled={isReadOnly}
						onChange={(e) => setDiscountEndAt(e.target.value)}
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
					{saving ? translateMessage('discount-saving') : translateMessage('discount-save')}
				</Button>
			</Box>
		</Box>
	);
}
