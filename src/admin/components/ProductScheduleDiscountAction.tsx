import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';
import { buildLocalizedVariantLabel } from '../../utils/attributeLocalization';

const api = new ApiClient();

const toDateOrNull = (value: string): Date | null => {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const direct = new Date(trimmed);
	if (!Number.isNaN(direct.getTime())) return direct;

	const localizedDateMatch = trimmed.match(
		/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:,\s*|\s+)(\d{1,2}):(\d{2})(?::(\d{2}))?$/
	);
	if (!localizedDateMatch) return null;

	const day = Number(localizedDateMatch[1]);
	const month = Number(localizedDateMatch[2]);
	const year = Number(localizedDateMatch[3]);
	const hours = Number(localizedDateMatch[4]);
	const minutes = Number(localizedDateMatch[5]);
	const seconds = localizedDateMatch[6] ? Number(localizedDateMatch[6]) : 0;

	const parsed = new Date(year, month - 1, day, hours, minutes, seconds);
	if (
		parsed.getFullYear() !== year ||
		parsed.getMonth() !== month - 1 ||
		parsed.getDate() !== day ||
		parsed.getHours() !== hours ||
		parsed.getMinutes() !== minutes ||
		parsed.getSeconds() !== seconds
	) {
		return null;
	}

	return parsed;
};

const toLocalInputValue = (value: string | null | undefined) => {
	if (!value) return '';
	const parsed = toDateOrNull(value);
	if (!parsed) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const toOptionalIsoString = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
};

const toOptionalFiniteNumber = (value: unknown): number | null => {
	if (value == null) return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const toDiscountAmountFromStoredPrice = (
	storedDiscountPrice: unknown,
	basePrice: number
): number | null => {
	if (!Number.isFinite(basePrice) || !(basePrice > 0)) return null;
	const stored = toOptionalFiniteNumber(storedDiscountPrice);
	if (stored == null) return null;
	const amount = Number((basePrice - stored).toFixed(2));
	if (!Number.isFinite(amount) || !(amount > 0)) return null;
	return amount;
};

const formatMoney = (value: number, currency = 'USD') => {
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

type ValidationMessageKey =
	| 'discount-window-invalid'
	| 'discount-price-required'
	| 'discount-price-invalid'
	| null;

type VariantPayload = {
	id: string;
	sku: string;
	stock: number;
	basePrice: number;
	discountPrice: number | null;
	discountStartAt: string | null;
	discountEndAt: string | null;
	label: string | null;
	attributes: Array<{
		name: string;
		value: string;
		unit: string | null;
	}>;
};

type ActionPayload = {
	product?: {
		id: string;
		basePrice: number;
		currency: string;
	} | null;
	variants?: VariantPayload[];
	discountStartAt?: string | null;
	discountEndAt?: string | null;
};

type VariantRowState = {
	id: string;
	sku: string;
	label: string | null;
	attributes: Array<{
		name: string;
		value: string;
		unit: string | null;
	}>;
	stock: number;
	basePrice: number;
	discountAmountInput: string;
	savedDiscountAmount: number | null;
	discountStartAt: string | null;
	discountEndAt: string | null;
};

const parseDiscountAmountInput = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) return { hasTyped: false, amount: null as number | null };
	const parsed = Number(trimmed);
	return {
		hasTyped: true,
		amount: Number.isFinite(parsed) ? parsed : null,
	};
};

const buildVariantRows = (variants: VariantPayload[]): VariantRowState[] =>
	variants.map((variant) => {
		const amount = toDiscountAmountFromStoredPrice(variant.discountPrice, Number(variant.basePrice ?? 0));
		return {
			id: variant.id,
			sku: variant.sku,
			label: variant.label ?? null,
			attributes: Array.isArray(variant.attributes) ? variant.attributes : [],
			stock: Number(variant.stock ?? 0),
			basePrice: Number(variant.basePrice ?? 0),
			discountAmountInput: amount != null ? String(amount) : '',
			savedDiscountAmount: amount,
			discountStartAt: toOptionalIsoString(variant.discountStartAt),
			discountEndAt: toOptionalIsoString(variant.discountEndAt),
		};
	});

export default function ProductScheduleDiscountAction({ action, record, resource }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage, i18n } = useTranslation();
	const isReadOnly = useIsReadOnlyAdmin();
	const addNoticeRef = useRef(addNotice);

	const productName = useMemo(() => String(record?.params?.name ?? ''), [record?.params?.name]);
	const productSlug = useMemo(() => String(record?.params?.slug ?? ''), [record?.params?.slug]);
	const productStatus = useMemo(() => String(record?.params?.status ?? ''), [record?.params?.status]);
	const productStatusLabel = useMemo(() => {
		if (!productStatus) return '';
		const translated = translateLabel(`status.${productStatus}`, resource.id);
		return translated && translated !== `status.${productStatus}` ? translated : productStatus;
	}, [productStatus, resource.id, translateLabel]);

	const title = translateAction(action.name, resource.id);
	const recordId = useMemo(
		() => String(record?.id ?? record?.params?.id ?? '').trim(),
		[record?.id, record?.params?.id]
	);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [currency, setCurrency] = useState('USD');
	const [variantRows, setVariantRows] = useState<VariantRowState[]>([]);
	const [discountStartAt, setDiscountStartAt] = useState('');
	const [discountEndAt, setDiscountEndAt] = useState('');

	useEffect(() => {
		addNoticeRef.current = addNotice;
	}, [addNotice]);

	useEffect(() => {
		if (!recordId) {
			setLoadError('product-variant-missing-record');
			setLoading(false);
			setVariantRows([]);
			return;
		}
		let isActive = true;
		setLoading(true);
		setLoadError(null);

		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: action.name,
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				const payload = (response.data?.payload ?? null) as ActionPayload | null;
				const payloadCurrency =
					payload?.product?.currency && typeof payload.product.currency === 'string'
						? payload.product.currency
						: 'USD';
				setCurrency(payloadCurrency);
				setVariantRows(buildVariantRows(payload?.variants ?? []));
				setDiscountStartAt(toLocalInputValue(payload?.discountStartAt ?? null));
				setDiscountEndAt(toLocalInputValue(payload?.discountEndAt ?? null));
			})
			.catch(() => {
				if (!isActive) return;
				setLoadError('discount-schedule-failed');
				addNoticeRef.current({ message: 'discount-schedule-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});

		return () => {
			isActive = false;
		};
	}, [action.name, recordId, resource.id]);

	const clientValidationMessageKey = useMemo<ValidationMessageKey>(() => {
		const hasWindow = Boolean(discountStartAt || discountEndAt);
		if (hasWindow && (!discountStartAt || !discountEndAt)) {
			return 'discount-window-invalid';
		}
		if (discountStartAt && discountEndAt) {
			const start = toDateOrNull(discountStartAt);
			const end = toDateOrNull(discountEndAt);
			if (!start || !end || start.getTime() >= end.getTime()) {
				return 'discount-window-invalid';
			}
		}

		let hasAnyDiscountAmount = false;
		for (const row of variantRows) {
			const parsed = parseDiscountAmountInput(row.discountAmountInput);
			if (parsed.hasTyped && parsed.amount == null) {
				return 'discount-price-invalid';
			}
			if (parsed.amount != null) {
				if (!Number.isFinite(parsed.amount) || !(parsed.amount > 0) || !(parsed.amount < row.basePrice)) {
					return 'discount-price-invalid';
				}
				hasAnyDiscountAmount = true;
			}
		}

		if (hasWindow && !hasAnyDiscountAmount) {
			return 'discount-price-required';
		}

		return null;
	}, [discountEndAt, discountStartAt, variantRows]);

	const clientValidationError = clientValidationMessageKey
		? translateMessage(clientValidationMessageKey)
		: null;

	const discountedVariantsCount = useMemo(
		() => variantRows.filter((row) => row.savedDiscountAmount != null && row.savedDiscountAmount > 0).length,
		[variantRows]
	);

	const currentSummary = useMemo(() => {
		if (discountedVariantsCount <= 0) return translateMessage('discount-none');
		const parsedStart = discountStartAt ? toDateOrNull(discountStartAt) : null;
		const parsedEnd = discountEndAt ? toDateOrNull(discountEndAt) : null;
		if (!parsedStart && !parsedEnd) {
			return translateMessage('discount-variants-always', { count: discountedVariantsCount });
		}
		return translateMessage('discount-variants-window', {
			count: discountedVariantsCount,
			start: parsedStart ? parsedStart.toLocaleString() : '-',
			end: parsedEnd ? parsedEnd.toLocaleString() : '-',
		});
	}, [discountEndAt, discountStartAt, discountedVariantsCount, translateMessage]);

	const handleVariantDiscountAmountChange = (variantId: string, value: string) => {
		setVariantRows((rows) =>
			rows.map((row) => (row.id === variantId ? { ...row, discountAmountInput: value } : row))
		);
	};

	const handleSave = async () => {
		if (!recordId || saving || loading) return;
		if (clientValidationMessageKey) {
			addNotice({ message: clientValidationMessageKey, type: 'error' });
			return;
		}
		setSaving(true);

		try {
			const parsedStartDate = discountStartAt ? toDateOrNull(discountStartAt) : null;
			const parsedEndDate = discountEndAt ? toDateOrNull(discountEndAt) : null;
			if ((discountStartAt && !parsedStartDate) || (discountEndAt && !parsedEndDate)) {
				addNotice({ message: 'discount-window-invalid', type: 'error' });
				return;
			}

			const variantDiscountsPayload = variantRows.map((row) => {
				const parsed = parseDiscountAmountInput(row.discountAmountInput);
				return {
					id: row.id,
					discountAmount: parsed.amount,
				};
			});

			const formData = new FormData();
			formData.append('variantDiscounts', JSON.stringify(variantDiscountsPayload));
			formData.append('discountStartAt', parsedStartDate ? parsedStartDate.toISOString() : '');
			formData.append('discountEndAt', parsedEndDate ? parsedEndDate.toISOString() : '');

			const response = await api.recordAction({
				resourceId: resource.id,
				recordId,
				actionName: action.name,
				method: 'post',
				data: formData,
			});

			const payload = (response.data?.payload ?? null) as ActionPayload | null;
			const payloadCurrency =
				payload?.product?.currency && typeof payload.product.currency === 'string'
					? payload.product.currency
					: currency;
			setCurrency(payloadCurrency);
			setVariantRows(buildVariantRows(payload?.variants ?? []));
			setDiscountStartAt(toLocalInputValue(payload?.discountStartAt ?? null));
			setDiscountEndAt(toLocalInputValue(payload?.discountEndAt ?? null));

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
			maxWidth='920px'
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

			<Text mb='lg'>{currentSummary}</Text>

			{loading ? (
				<Text color='grey60'>{translateMessage('product-variant-loading')}</Text>
			) : loadError ? (
				<Text color='red60'>{translateMessage(loadError)}</Text>
			) : (
					<>
						<Box mb='xl' style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
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
										maxWidth: '100%',
										boxSizing: 'border-box',
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
										maxWidth: '100%',
										boxSizing: 'border-box',
										padding: '10px 12px',
										borderRadius: 8,
										border: '1px solid #E2E8F0',
										marginTop: 10,
										fontSize: 15,
									}}
								/>
							</Box>
					</Box>

					{variantRows.length === 0 ? (
						<Text color='grey60'>{translateMessage('product-variant-no-variants')}</Text>
						) : (
							<Box style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
								{variantRows.map((row) => (
									<Box
										key={row.id}
										style={{
											border: '1px solid #E2E8F0',
											borderRadius: 10,
											padding: 12,
											minWidth: 0,
										}}
									>
										<Text fontWeight='bold'>
											{buildLocalizedVariantLabel(row.attributes, i18n?.language) || row.label || row.sku}
										</Text>
										<Text color='grey60' mb='sm'>
											{row.sku} • {translateMessage('product-variant-stock-label')}: {row.stock}
										</Text>
										<Text color='grey60' mb='md'>
											{translateMessage('discount-base-price')}: {formatMoney(row.basePrice, currency)}
										</Text>
									<FormGroup label={translateMessage('discount-price-label')} mb='0'>
										<input
											type='number'
											step='0.01'
											min='0'
											max={Number.isFinite(row.basePrice) && row.basePrice > 0 ? row.basePrice : undefined}
												value={row.discountAmountInput}
												disabled={isReadOnly}
												onChange={(e) => handleVariantDiscountAmountChange(row.id, e.target.value)}
												placeholder='0.00'
												style={{
													width: '100%',
													maxWidth: '100%',
													boxSizing: 'border-box',
													padding: '10px 12px',
													borderRadius: 8,
													border: '1px solid #E2E8F0',
													fontSize: 15,
												}}
											/>
										</FormGroup>
									</Box>
							))}
						</Box>
					)}
				</>
			)}

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
					disabled={isReadOnly || saving || loading}
				>
					{saving ? translateMessage('discount-saving') : translateMessage('discount-save')}
				</Button>
			</Box>
		</Box>
	);
}
