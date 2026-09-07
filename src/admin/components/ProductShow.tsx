import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ApiClient, type ActionProps, OriginalShow, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Icon, Modal, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';
import { DEFAULT_LOCALE } from '../../constants/locales';
import ProductActivityTimeline from './ProductActivityTimeline';
import ProductInventoryHistory from './ProductInventoryHistory';

const api = new ApiClient();

type ProductKpisPayload = {
	wishlistCount: number;
	recentlyViewedCount: number;
	itemsSold: number;
	revenue: number;
	paidOrderCount: number;
	conversionProxy: number;
};

type ProductRelatedPayload = {
	orderItems: {
		id: string;
		orderId: string;
		orderStatus: string;
		quantity: number;
		unitPrice: number;
		lineTotal: number;
		createdAt: string | null;
	}[];
	reviews: {
		id: string;
		rating: number;
		comment: string;
		createdAt: string | null;
		userId: string;
		userName: string;
	}[];
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

const formatDate = (value: string | null) => {
	if (!value) return '-';
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
};

const normalizeNumberParam = (value: unknown) => {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'bigint') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		const numeric = (value as any).toNumber();
		return Number.isFinite(numeric) ? numeric : 0;
	}
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : 0;
};

const getRootPath = () => {
	if (typeof window === 'undefined') return '';
	const path = window.location.pathname ?? '';
	const parts = path.split('/resources');
	return parts[0] ?? '';
};

const buildRecordShowHref = (resourceId: string, recordId: string) =>
	`${getRootPath()}/resources/${resourceId}/records/${recordId}/show`;

const resolveStorefrontLocale = (adminLocale?: string) => {
	const normalized = adminLocale?.split('-')[0];
	if (normalized === 'ua') return 'uk';
	if (normalized === 'en') return 'en';
	return DEFAULT_LOCALE;
};

const buildPreviewPath = (locale: string, fullSlug: string) => {
	const basePath = `/products/${fullSlug}`;
	return locale === DEFAULT_LOCALE ? basePath : `/${locale}${basePath}`;
};

export default function ProductShow(props: ActionProps) {
	const { record, resource, action } = props;
	const { translateAction, translateLabel, translateMessage, i18n } = useTranslation();
	const addNotice = useNotice();
	const recordId = record?.id;
	const name = String(record?.params?.name ?? '');
	const imageUrl = (record?.params?.imageUrl as string | null | undefined) ?? null;
	const status = String(record?.params?.status ?? '');
	const statusLabel = useMemo(() => {
		if (!status) return '';
		const translated = translateLabel(`status.${status}`, resource.id);
		return translated && translated !== `status.${status}` ? translated : status;
	}, [resource.id, status, translateLabel]);
	const fullSlug = String(record?.params?.fullSlug ?? '').trim();
	const storefrontLocale = resolveStorefrontLocale(i18n?.language);
	const previewPath = fullSlug ? buildPreviewPath(storefrontLocale, fullSlug) : '';
	const previewBaseUrl =
		typeof action?.custom?.previewBaseUrl === 'string' ? action.custom.previewBaseUrl.trim() : '';
	const fallbackBaseUrl = typeof window === 'undefined' ? '' : window.location.origin;
	const resolvedBaseUrl = previewBaseUrl || fallbackBaseUrl;
	const previewUrl =
		!previewPath || !resolvedBaseUrl ? '' : new URL(previewPath, resolvedBaseUrl).toString();
	const [isOpen, setIsOpen] = useState(false);
	const [payload, setPayload] = useState<ProductKpisPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const [related, setRelated] = useState<ProductRelatedPayload | null>(null);
	const [relatedLoading, setRelatedLoading] = useState(false);
	const sanitizedRecord = useMemo(() => {
		if (!record) return record;
		const params = { ...record.params };
		const basePrice = normalizeNumberParam(params.basePrice);
		const discountRaw = params.discountPrice;
		const normalizedDiscount = normalizeNumberParam(discountRaw);
		const numericKeys = ['stock', 'averageRating', 'reviewCount', 'sortPrice'];
		params.basePrice = basePrice;
		params.discountPrice = discountRaw == null ? basePrice : normalizedDiscount;
		numericKeys.forEach((key) => {
			params[key] = normalizeNumberParam(params[key]);
		});
		return { ...record, params };
	}, [record]);

	const openImage = (e?: MouseEvent) => {
		if (e) e.stopPropagation();
		if (!imageUrl) return;
		setIsOpen(true);
	};

	const openPreview = () => {
		if (!previewUrl) {
			addNotice({ message: 'product-preview-missing-slug', type: 'error' });
			return;
		}
		window.open(previewUrl, '_blank', 'noopener,noreferrer');
	};

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'productKpis',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setPayload((response.data.payload ?? null) as ProductKpisPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setRelatedLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'productRelatedData',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setRelated((response.data.payload ?? null) as ProductRelatedPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setRelatedLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	const conversionText = useMemo(() => {
		if (!payload || payload.recentlyViewedCount <= 0 || !Number.isFinite(payload.conversionProxy)) {
			return '0.00%';
		}
		return `${(payload.conversionProxy * 100).toFixed(2)}%`;
	}, [payload]);

	return (
		<Box>
			{isOpen && imageUrl ? (
				<Modal
					onClose={() => setIsOpen(false)}
					onOverlayClick={() => setIsOpen(false)}
					style={{
						width: '92vw',
						maxWidth: 980,
						padding: 24,
						paddingTop: 48,
					}}
				>
					<img
						src={imageUrl}
						alt={translateMessage('product-image-modal-alt')}
						style={{
							width: '100%',
							height: 'auto',
							maxHeight: '78vh',
							objectFit: 'contain',
							borderRadius: 12,
							background: '#F8FAFC',
							display: 'block',
						}}
					/>
				</Modal>
			) : null}

			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}
			>
				<Box
					style={{
						width: 160,
						height: 160,
						borderRadius: 18,
						border: '1px solid #E2E8F0',
						background: '#F8FAFC',
						overflow: 'hidden',
						flexShrink: 0,
					}}
				>
					{imageUrl ? (
						<button
							type='button'
							onClick={openImage}
							style={{
								all: 'unset',
								cursor: 'pointer',
								display: 'block',
								width: '100%',
								height: '100%',
							}}
							aria-label={translateMessage('product-image-modal-open')}
						>
							<img
								src={imageUrl}
								alt=''
								style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
								loading='lazy'
							/>
						</button>
					) : null}
				</Box>
				<Box style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
					<Box style={{ minWidth: 0, flex: 1 }}>
						<Text
							fontWeight='bold'
							fontSize='xl'
							style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
						>
							{name || 'Product'}
						</Text>
						{status ? <Text color='grey60'>{statusLabel}</Text> : null}
					</Box>
					<Button
						variant='outlined'
						color='primary'
						onClick={openPreview}
						disabled={!previewUrl}
						style={{ whiteSpace: 'nowrap' }}
					>
						<Icon icon='ExternalLink' />
						{translateAction('previewProduct', resource.id)}
					</Button>
				</Box>
			</Box>

			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				className='admin-card--kpis'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Text fontWeight='bold' mb='lg'>
					{translateMessage('product-kpis')}
				</Text>
				{loading || !payload ? (
					<Text color='grey60'>{translateMessage('product-kpis-loading')}</Text>
				) : (
					<Box
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
							gap: 16,
						}}
					>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>{translateMessage('product-kpis-wishlist')}</Text>
							<Text fontWeight='bold'>{payload.wishlistCount}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>{translateMessage('product-kpis-recently-viewed')}</Text>
							<Text fontWeight='bold'>{payload.recentlyViewedCount}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>{translateMessage('product-kpis-items-sold')}</Text>
							<Text fontWeight='bold'>{payload.itemsSold}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>{translateMessage('product-kpis-revenue')}</Text>
							<Text fontWeight='bold'>{formatMoney(payload.revenue)}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>{translateMessage('product-kpis-conversion-proxy')}</Text>
							<Text fontWeight='bold'>{conversionText}</Text>
							<Text color='grey60' style={{ fontSize: 15 }}>
								{payload.paidOrderCount} / {payload.recentlyViewedCount || 0}
							</Text>
						</Box>
					</Box>
				)}
			</Box>

			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Text fontWeight='bold' mb='lg'>
					{translateMessage('product-related')}
				</Text>
				{relatedLoading || !related ? (
					<Text color='grey60'>{translateMessage('product-related-loading')}</Text>
				) : (
					<Box style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('product-related-order-items')}
							</Text>
							{related.orderItems.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('product-related-order-id')}</TableCell>
											<TableCell>{translateMessage('product-related-order-status')}</TableCell>
											<TableCell>{translateMessage('product-related-order-quantity')}</TableCell>
											<TableCell>{translateMessage('product-related-order-unit-price')}</TableCell>
											<TableCell>{translateMessage('product-related-order-total')}</TableCell>
											<TableCell>{translateMessage('product-related-order-created')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.orderItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													{item.orderId && item.orderId !== '-' ? (
														<a href={buildRecordShowHref('Order', item.orderId)} style={{ fontWeight: 600 }}>
															{item.orderId}
														</a>
													) : (
														'-'
													)}
												</TableCell>
												<TableCell>{item.orderStatus}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>{formatMoney(item.unitPrice)}</TableCell>
												<TableCell>{formatMoney(item.lineTotal)}</TableCell>
												<TableCell>{formatDate(item.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('product-related-empty')}</Text>
							)}
						</Box>

						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('product-related-reviews')}
							</Text>
							{related.reviews.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('product-related-review-user')}</TableCell>
											<TableCell>{translateMessage('product-related-review-rating')}</TableCell>
											<TableCell>{translateMessage('product-related-review-comment')}</TableCell>
											<TableCell>{translateMessage('product-related-review-created')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.reviews.map((review) => (
											<TableRow key={review.id}>
												<TableCell>
													<a href={buildRecordShowHref('User', review.userId)} style={{ fontWeight: 600 }}>
														{review.userName}
													</a>
												</TableCell>
												<TableCell>{review.rating}</TableCell>
												<TableCell>
													<Text
														style={{
															maxWidth: 420,
															whiteSpace: 'nowrap',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
														}}
													>
														{review.comment}
													</Text>
												</TableCell>
												<TableCell>{formatDate(review.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('product-related-empty')}</Text>
							)}
						</Box>
					</Box>
				)}
			</Box>

			<ProductActivityTimeline
				{...props}
				actionNameOverride='activityTimeline'
				titleOverride={translateMessage('product-activity-title')}
			/>

			<ProductInventoryHistory {...props} />

			<OriginalShow {...props} record={sanitizedRecord ?? record} />
		</Box>
	);
}
