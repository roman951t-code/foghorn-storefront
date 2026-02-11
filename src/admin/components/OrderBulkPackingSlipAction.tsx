import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Icon, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';

const api = new ApiClient();

type PackingSlipItem = {
	name: string;
	quantity: number;
	unitPrice: number;
	price: number;
};

type PackingSlipPayload = {
	orderId: string;
	createdAt: string;
	status: string;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	shippingAddress: string | null;
	shippingCountry: string | null;
	shippingRegion: string | null;
	shippingCity: string | null;
	shippingPostalCode: string | null;
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	total: number;
	items: PackingSlipItem[];
};

type BulkPackingPayload = {
	orders: PackingSlipPayload[];
};

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
	padding: '12px 20px',
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

const normalizeFullName = (first: string | null, last: string | null) => {
	const firstTrimmed = (first ?? '').trim();
	const lastTrimmed = (last ?? '').trim();
	if (!firstTrimmed && !lastTrimmed) return null;
	if (!lastTrimmed) return firstTrimmed || null;
	if (!firstTrimmed) return lastTrimmed || null;

	const firstLower = firstTrimmed.toLocaleLowerCase();
	const lastLower = lastTrimmed.toLocaleLowerCase();
	if (firstLower.includes(lastLower)) {
		return firstTrimmed;
	}
	return `${firstTrimmed} ${lastTrimmed}`;
};

const buildShippingAddressLines = (order: PackingSlipPayload): string[] => {
	const lines = [
		order.shippingAddressLine1,
		order.shippingAddressLine2,
		[order.shippingCity, order.shippingRegion, order.shippingPostalCode].filter(Boolean).join(', '),
		order.shippingCountry,
	]
		.map((line) => (line ?? '').trim())
		.filter(Boolean);

	if (lines.length) return lines;
	if (order.shippingAddress?.trim()) return [order.shippingAddress.trim()];
	return [];
};

export default function OrderBulkPackingSlipAction({ action, resource, records }: ActionProps) {
	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const [payload, setPayload] = useState<BulkPackingPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const addNotice = useNotice();
	const addNoticeRef = useRef(addNotice);
	const { translateAction, translateMessage } = useTranslation();

	useEffect(() => {
		addNoticeRef.current = addNotice;
	}, [addNotice]);

	useEffect(() => {
		if (!recordIds.length) return;
		let isActive = true;
		setLoading(true);
		api.bulkAction({
			resourceId: resource.id,
			recordIds,
			actionName: action.name,
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setPayload((response.data.payload ?? null) as BulkPackingPayload | null);
			})
			.catch(() => {
				if (!isActive) return;
				addNoticeRef.current({ message: 'packing-slip-load-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [action.name, recordIds, resource.id]);

	const title = translateAction(action.name, resource.id);

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Box>
					<Text fontSize='xl' fontWeight='bold'>
						{title}
					</Text>
					<Text color='grey60'>
						{translateMessage('order-bulk-selected', { count: recordIds.length })}
					</Text>
				</Box>
				<Button
					variant='contained'
					color='primary'
					onClick={() => window.print()}
					style={actionButtonStyle}
					disabled={loading || !payload?.orders?.length}
				>
					<Icon icon='Printer' />
					{translateMessage('packing-slip-print')}
				</Button>
			</Box>

			{loading || !payload ? (
				<Text color='grey60'>
					{loading ? translateMessage('packing-slip-loading') : translateMessage('packing-slip-load-failed')}
				</Text>
			) : payload.orders.length === 0 ? (
				<Text color='grey60'>{translateMessage('order-bulk-empty')}</Text>
			) : (
				<Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
					{payload.orders.map((order, index) => {
						const customer = normalizeFullName(order.contactName, order.contactLastName);
						const shippingAddressLines = buildShippingAddressLines(order);
						const isLast = index === payload.orders.length - 1;
						return (
							<Box
								key={order.orderId}
								style={{
									border: '1px solid #E2E8F0',
									borderRadius: 16,
									padding: 16,
									pageBreakAfter: isLast ? 'auto' : 'always',
								}}
							>
								<Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
									<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
										<Text color='grey60' fontSize='sm'>
											{translateMessage('packing-slip-order')}
										</Text>
										<Text fontWeight='bold'>{order.orderId}</Text>
										<Text color='grey60' fontSize='sm'>
											{new Date(order.createdAt).toLocaleString()}
										</Text>
									</Box>
									<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
										<Text color='grey60' fontSize='sm'>
											{translateMessage('packing-slip-customer')}
										</Text>
										<Text fontWeight='bold'>{customer ?? '-'}</Text>
										<Text color='grey60' fontSize='sm'>
											{order.contactPhone ?? order.contactEmail ?? '-'}
										</Text>
									</Box>
									<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
										<Text color='grey60' fontSize='sm'>
											{translateMessage('packing-slip-shipping-address')}
										</Text>
										{shippingAddressLines.length ? (
											<Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												{shippingAddressLines.map((line, lineIndex) => (
													<Text key={`${order.orderId}-${line}-${lineIndex}`} fontWeight={lineIndex === 0 ? 'bold' : 'normal'}>
														{line}
													</Text>
												))}
											</Box>
										) : (
											<Text fontWeight='bold'>-</Text>
										)}
									</Box>
									<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
										<Text color='grey60' fontSize='sm'>
											{translateMessage('packing-slip-fulfillment')}
										</Text>
										<Text fontWeight='bold'>{order.carrier ?? '-'}</Text>
										<Text color='grey60' fontSize='sm'>
											{order.trackingNumber ?? '-'}
										</Text>
									</Box>
								</Box>

								<Box mt='lg'>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>{translateMessage('packing-slip-item')}</TableCell>
												<TableCell>{translateMessage('packing-slip-qty')}</TableCell>
												<TableCell>{translateMessage('packing-slip-unit')}</TableCell>
												<TableCell>{translateMessage('packing-slip-line')}</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{order.items.map((item, itemIndex) => (
												<TableRow key={`${order.orderId}-${item.name}-${itemIndex}`}>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>{formatMoney(item.unitPrice)}</TableCell>
													<TableCell>{formatMoney(item.price)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Box>

								<Box display='flex' justifyContent='flex-end' mt='lg'>
									<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, minWidth: 260 }}>
										<Text color='grey60' fontSize='sm'>
											{translateMessage('total')}
										</Text>
										<Text fontSize='xl' fontWeight='bold'>
											{formatMoney(order.total)}
										</Text>
									</Box>
								</Box>
							</Box>
						);
					})}
				</Box>
			)}
		</Box>
	);
}
