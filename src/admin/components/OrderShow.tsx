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
};

const formatMoney = (value: number, currency = 'UAH') => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return value.toFixed(2);
	}
};

export default function OrderShow(props: ActionProps) {
	const { record, resource } = props;
	const recordId = record?.id;
	const { translateMessage } = useTranslation();
	const [payload, setPayload] = useState<FinancialBreakdownPayload | null>(null);
	const [loading, setLoading] = useState(false);

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
				)}
			</Box>

			<OriginalShow {...props} />
		</Box>
	);
}
