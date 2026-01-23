import { useEffect, useRef, useState } from 'react';
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
	carrier: string | null;
	trackingNumber: string | null;
	total: number;
	items: PackingSlipItem[];
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

export default function OrderPackingSlipAction({ action, record, resource }: ActionProps) {
	const recordId = record?.id;
	const [payload, setPayload] = useState<PackingSlipPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const addNotice = useNotice();
	const addNoticeRef = useRef(addNotice);
	const { translateAction, translateMessage } = useTranslation();

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
				setPayload((response.data.payload ?? null) as PackingSlipPayload | null);
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
	}, [action.name, recordId, resource.id]);

	const title = translateAction(action.name, resource.id);
	const customer = payload ? normalizeFullName(payload.contactName, payload.contactLastName) : null;

	return (
		<Box
			variant='white'
			p='xxl'
			borderRadius='xl'
			boxShadow='sm'
			maxWidth='920px'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
				<Button
					variant='contained'
					color='primary'
					onClick={() => window.print()}
					style={{ borderColor: 'white', background: '#facc15', color: 'black' }}
				>
					<Icon icon='Printer' />
					{translateMessage('packing-slip-print')}
				</Button>
			</Box>

			{loading || !payload ? (
				<Text color='grey60'>
					{loading ? translateMessage('packing-slip-loading') : translateMessage('packing-slip-load-failed')}
				</Text>
			) : (
				<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					<Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
						<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
							<Text color='grey60' fontSize='sm'>
								{translateMessage('packing-slip-order')}
							</Text>
							<Text fontWeight='bold'>{payload.orderId}</Text>
							<Text color='grey60' fontSize='sm'>
								{new Date(payload.createdAt).toLocaleString()}
							</Text>
						</Box>
						<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
							<Text color='grey60' fontSize='sm'>
								{translateMessage('packing-slip-customer')}
							</Text>
							<Text fontWeight='bold'>{customer ?? '-'}</Text>
							<Text color='grey60' fontSize='sm'>
								{payload.contactPhone ?? payload.contactEmail ?? '-'}
							</Text>
						</Box>
						<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
							<Text color='grey60' fontSize='sm'>
								{translateMessage('packing-slip-fulfillment')}
							</Text>
							<Text fontWeight='bold'>
								{payload.carrier ?? '-'}
							</Text>
							<Text color='grey60' fontSize='sm'>
								{payload.trackingNumber ?? '-'}
							</Text>
						</Box>
					</Box>

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
							{payload.items.map((item, index) => (
								<TableRow key={`${item.name}-${index}`}>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>{formatMoney(item.unitPrice)}</TableCell>
									<TableCell>{formatMoney(item.price)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<Box display='flex' justifyContent='flex-end'>
						<Box style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, minWidth: 260 }}>
							<Text color='grey60' fontSize='sm'>
								{translateMessage('total')}
							</Text>
							<Text fontSize='xl' fontWeight='bold'>
								{formatMoney(payload.total)}
							</Text>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}
