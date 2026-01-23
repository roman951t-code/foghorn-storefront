import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text } from '@adminjs/design-system';

const api = new ApiClient();

type FulfillmentPayload = {
	carrier: string | null;
	trackingNumber: string | null;
};

const extractPayload = (payload: unknown): FulfillmentPayload => {
	if (!payload || typeof payload !== 'object') {
		return { carrier: null, trackingNumber: null };
	}
	const maybe = payload as Partial<FulfillmentPayload>;
	return {
		carrier: typeof maybe.carrier === 'string' ? maybe.carrier : null,
		trackingNumber: typeof maybe.trackingNumber === 'string' ? maybe.trackingNumber : null,
	};
};

export default function OrderFulfillmentAction({ action, record, resource }: ActionProps) {
	const recordId = record?.id;
	const [carrier, setCarrier] = useState('');
	const [trackingNumber, setTrackingNumber] = useState('');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const addNotice = useNotice();
	const addNoticeRef = useRef(addNotice);
	const { translateAction, translateMessage } = useTranslation();

	useEffect(() => {
		addNoticeRef.current = addNotice;
	}, [addNotice]);

	const load = useCallback(() => {
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
				const payload = extractPayload(response.data.payload);
				setCarrier(payload.carrier ?? '');
				setTrackingNumber(payload.trackingNumber ?? '');
			})
			.catch(() => {
				if (!isActive) return;
				addNoticeRef.current({ message: 'fulfillment-load-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [action.name, recordId, resource.id]);

	useEffect(() => {
		return load();
	}, [load]);

	if (!recordId) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('fulfillment-load-failed')}</Text>
			</Box>
		);
	}

	const title = translateAction(action.name, resource.id);

	const handleSave = async () => {
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('carrier', carrier);
			formData.append('trackingNumber', trackingNumber);
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
			const payload = extractPayload(response.data.payload);
			setCarrier(payload.carrier ?? '');
			setTrackingNumber(payload.trackingNumber ?? '');
		} catch {
			addNotice({ message: 'fulfillment-save-failed', type: 'error' });
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
			maxWidth='680px'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
			</Box>
			{loading ? (
				<Text color='grey60'>{translateMessage('fulfillment-load-progress')}</Text>
			) : (
				<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					<FormGroup>
						<Label>{translateMessage('fulfillment-carrier')}</Label>
						<Input
							value={carrier}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setCarrier(e.target.value)}
						/>
					</FormGroup>
					<FormGroup>
						<Label>{translateMessage('fulfillment-tracking-number')}</Label>
						<Input
							value={trackingNumber}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackingNumber(e.target.value)}
						/>
					</FormGroup>
					<Box>
						<Button
							style={{ borderColor: 'white', background: '#facc15', color: 'black' }}
							variant='contained'
							color='primary'
							onClick={handleSave}
							disabled={saving}
						>
							{saving ? translateMessage('fulfillment-save-progress') : translateMessage('confirm')}
						</Button>
					</Box>
				</Box>
			)}
		</Box>
	);
}
