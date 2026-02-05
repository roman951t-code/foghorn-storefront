import { useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, OriginalShow, useTranslation } from 'adminjs';
import { Badge, Box, Text } from '@adminjs/design-system';

const api = new ApiClient();

type PaymentStatus = 'PAID' | 'UNPAID' | 'CANCELLED';

type FinancialBreakdownPayload = {
	subtotal: number;
	discounts: number;
	shipping: number;
	total: number;
	paymentStatus: PaymentStatus;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	discountDetails: DiscountDetail[];
};

type DiscountDetail = {
	id: string;
	label: string | null;
	code: string | null;
	amount: number;
};

type OrderItemSummary = {
	id: string;
	productId: string;
	productName: string;
	productImageUrl: string | null;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
};

type OrderItemsPayload = {
	items: OrderItemSummary[];
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

export default function OrderShow(props: ActionProps) {
	const { record, resource } = props;
	const recordId = record?.id;
	const { translateMessage } = useTranslation();
	const [payload, setPayload] = useState<FinancialBreakdownPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const [itemsPayload, setItemsPayload] = useState<OrderItemsPayload | null>(null);
	const [itemsLoading, setItemsLoading] = useState(false);

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'financialBreakdown',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setPayload((response.data.payload ?? null) as FinancialBreakdownPayload | null);
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
		setItemsLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'orderItems',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setItemsPayload((response.data.payload ?? null) as OrderItemsPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setItemsLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	const getRootPath = () => {
		if (typeof window === 'undefined') return '';
		const path = window.location.pathname ?? '';
		const parts = path.split('/resources');
		return parts[0] ?? '';
	};

	const buildRecordShowHref = (resourceId: string, targetId: string) =>
		`${getRootPath()}/resources/${resourceId}/records/${targetId}/show`;

	const statusVariant = useMemo(() => {
		switch (payload?.paymentStatus) {
			case 'PAID':
				return { background: '#C6F6D5', borderColor: '#38A169', color: '#22543D' };
			case 'CANCELLED':
				return { background: '#FED7D7', borderColor: '#E53E3E', color: '#742A2A' };
			default:
				return { background: '#FEFCBF', borderColor: '#D69E2E', color: '#744210' };
		}
	}, [payload?.paymentStatus]);

	const paymentStatusLabel = useMemo(() => {
		switch (payload?.paymentStatus) {
			case 'PAID':
				return translateMessage('payment-status-paid');
			case 'CANCELLED':
				return translateMessage('payment-status-cancelled');
			default:
				return translateMessage('payment-status-unpaid');
		}
	}, [payload?.paymentStatus, translateMessage]);

	return (
		<Box>
			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				className='admin-card--financial'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Text fontWeight='bold'>{translateMessage('financial-breakdown')}</Text>
					<Badge
						outline
						style={{
							background: statusVariant.background,
							borderColor: statusVariant.borderColor,
							color: statusVariant.color,
						}}
					>
						{paymentStatusLabel}
					</Badge>
				</Box>

				{loading || !payload ? (
					<Text color='grey60'>{translateMessage('financial-breakdown-loading')}</Text>
				) : (
					<>
						<Box
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
								gap: 16,
							}}
						>
							<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
								<Text color='grey60'>{translateMessage('subtotal')}</Text>
								<Text fontWeight='bold'>{formatMoney(payload.subtotal)}</Text>
							</Box>
							<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
								<Text color='grey60'>{translateMessage('discounts')}</Text>
								<Text fontWeight='bold'>{formatMoney(payload.discounts)}</Text>
							</Box>
							<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
								<Text color='grey60'>{translateMessage('shipping')}</Text>
								<Text fontWeight='bold'>{formatMoney(payload.shipping)}</Text>
							</Box>
							<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
								<Text color='grey60'>{translateMessage('total')}</Text>
								<Text fontWeight='bold'>{formatMoney(payload.total)}</Text>
							</Box>
						</Box>
						<Box mt='lg'>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('order-discounts-title')}
							</Text>
							{payload.discountDetails.length === 0 ? (
								<Text color='grey60'>{translateMessage('order-discounts-empty')}</Text>
							) : (
								<Box style={{ display: 'grid', gap: 8 }}>
									{payload.discountDetails.map((discount) => (
										<Box
											key={discount.id}
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												gap: 12,
												padding: '8px 12px',
												borderRadius: 10,
												border: '1px solid #E2E8F0',
											}}
										>
											<Box>
												<Text fontWeight='bold'>
													{discount.label ?? translateMessage('order-discount-generic')}
												</Text>
												{discount.code ? (
														<Text color='grey60' style={{ fontSize: 13 }}>
															{translateMessage('order-discount-code', { code: discount.code })}
														</Text>
												) : null}
											</Box>
											<Text fontWeight='bold'>-{formatMoney(discount.amount)}</Text>
										</Box>
									))}
								</Box>
							)}
						</Box>
					</>
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
					{translateMessage('order-items-title')}
				</Text>
				{itemsLoading || !itemsPayload ? (
					<Text color='grey60'>{translateMessage('order-items-loading')}</Text>
				) : itemsPayload.items.length === 0 ? (
					<Text color='grey60'>{translateMessage('order-items-empty')}</Text>
				) : (
					<Box style={{ display: 'grid', gap: 12 }}>
						{itemsPayload.items.map((item) => (
							<Box
								key={item.id}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 16,
									padding: '12px 14px',
									borderRadius: 10,
									border: '1px solid #E2E8F0',
								}}
							>
								<Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
									<Box
										style={{
											width: 50,
											height: 50,
											borderRadius: 10,
											overflow: 'hidden',
											background: '#F1F5F9',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										{item.productImageUrl ? (
											<img
												src={item.productImageUrl}
												alt={item.productName}
												loading='lazy'
												style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
											/>
										) : (
											<Text fontWeight='bold' color='grey60'>
												{item.productName?.slice(0, 1) ?? '?'}
											</Text>
										)}
									</Box>
									<Box style={{ minWidth: 0 }}>
										<a
											href={buildRecordShowHref('Product', item.productId)}
											style={{ fontWeight: 600, display: 'block' }}
										>
											{item.productName}
										</a>
										<Text color='grey60' style={{ fontSize: 13 }}>
											{translateMessage('order-items-qty', { count: item.quantity })}
										</Text>
									</Box>
								</Box>
								<Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
									<Box>
											<Text color='grey60' style={{ fontSize: 13 }}>
												{translateMessage('order-items-unit-price')}
											</Text>
										<Text fontWeight='bold'>{formatMoney(item.unitPrice)}</Text>
									</Box>
									<Box>
											<Text color='grey60' style={{ fontSize: 13 }}>
												{translateMessage('order-items-line-total')}
											</Text>
										<Text fontWeight='bold'>{formatMoney(item.lineTotal)}</Text>
									</Box>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<OriginalShow {...props} />
		</Box>
	);
}
