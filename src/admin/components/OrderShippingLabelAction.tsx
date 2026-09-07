import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Badge, Box, Button, Icon, Text } from '@adminjs/design-system';

const api = new ApiClient();

type ShippingLabelPayload = {
	orderId: string;
	createdAt: string;
	status: string;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	shipmentMethod: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	shippingAddress: string | null;
	shippingCountry: string | null;
	shippingRegion: string | null;
	shippingCity: string | null;
	shippingPostalCode: string | null;
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
};

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
	padding: '12px 20px',
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

const buildAddressLines = (payload: ShippingLabelPayload): string[] => {
	const lines = [
		payload.shippingAddressLine1,
		payload.shippingAddressLine2,
		[payload.shippingCity, payload.shippingRegion, payload.shippingPostalCode]
			.filter(Boolean)
			.join(', '),
		payload.shippingCountry,
	]
		.map((line) => (line ?? '').trim())
		.filter(Boolean);

	if (lines.length) return lines;
	if (payload.shippingAddress?.trim()) return [payload.shippingAddress.trim()];
	return [];
};

export default function OrderShippingLabelAction({ action, record, resource }: ActionProps) {
	const recordId = record?.id;
	const [payload, setPayload] = useState<ShippingLabelPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const addNotice = useNotice();
	const addNoticeRef = useRef(addNotice);
	const { translateAction, translateMessage, translateLabel } = useTranslation();

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
				setPayload((response.data.payload ?? null) as ShippingLabelPayload | null);
			})
			.catch(() => {
				if (!isActive) return;
				addNoticeRef.current({ message: 'shipping-label-load-failed', type: 'error' });
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
	const recipientName = payload
		? normalizeFullName(payload.contactName, payload.contactLastName) ??
			payload.contactEmail ??
			payload.contactPhone ??
			'-'
		: '-';
	const addressLines = useMemo(() => (payload ? buildAddressLines(payload) : []), [payload]);

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
				<Button
					variant='contained'
					color='primary'
					onClick={() => window.print()}
					style={actionButtonStyle}
					disabled={loading || !payload}
				>
					<Icon icon='Printer' />
					{translateMessage('shipping-label-print')}
				</Button>
			</Box>

			{loading || !payload ? (
				<Text color='grey60'>
					{loading ? translateMessage('shipping-label-loading') : translateMessage('shipping-label-load-failed')}
				</Text>
			) : (
				<Box
					style={{
						maxWidth: 640,
						border: '2px solid #0F172A',
						borderRadius: 16,
						padding: 18,
						display: 'flex',
						flexDirection: 'column',
						gap: 14,
					}}
				>
					<Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
						<Text fontWeight='bold' style={{ letterSpacing: 1 }}>
							{translateMessage('shipping-label-to')}
						</Text>
						<Badge>{translateLabel(`status.${payload.status}`)}</Badge>
					</Box>

					<Box style={{ border: '1px dashed #334155', borderRadius: 12, padding: 12 }}>
						<Text fontWeight='bold' style={{ fontSize: 18, marginBottom: 6 }}>
							{recipientName}
						</Text>
						<Text color='grey60'>{payload.contactPhone ?? payload.contactEmail ?? '-'}</Text>
						{addressLines.length ? (
							<Box mt='md' style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								{addressLines.map((line, index) => (
									<Text key={`${line}-${index}`} fontWeight={index === 0 ? 'bold' : 'normal'}>
										{line}
									</Text>
								))}
							</Box>
						) : (
							<Text mt='md' color='grey60'>
								{translateMessage('shipping-label-address-missing')}
							</Text>
						)}
					</Box>

					<Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
						<Box style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 10 }}>
							<Text color='grey60' style={{ fontSize: 15 }}>
								{translateMessage('shipping-label-order')}
							</Text>
							<Text fontWeight='bold'>{payload.orderId}</Text>
						</Box>
						<Box style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 10 }}>
							<Text color='grey60' style={{ fontSize: 15 }}>
								{translateMessage('shipping-label-service')}
							</Text>
							<Text fontWeight='bold'>{payload.shipmentMethod ?? '-'}</Text>
						</Box>
						<Box style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 10 }}>
							<Text color='grey60' style={{ fontSize: 15 }}>
								{translateMessage('shipping-label-carrier')}
							</Text>
							<Text fontWeight='bold'>{payload.carrier ?? '-'}</Text>
						</Box>
						<Box style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 10 }}>
							<Text color='grey60' style={{ fontSize: 15 }}>
								{translateMessage('shipping-label-tracking')}
							</Text>
							<Text fontWeight='bold'>{payload.trackingNumber ?? '-'}</Text>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}
