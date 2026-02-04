import { useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

export default function CancelOrderAction({ action, record, resource }: ActionProps) {
	const [localRecord, setLocalRecord] = useState(record);
	const [refundPayment, setRefundPayment] = useState(false);
	const [loading, setLoading] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();

	if (!localRecord) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('status-update-failed')}</Text>
			</Box>
		);
	}

	const stripeSessionId = localRecord.params.stripeSessionId as string | undefined;
	const canRefund = Boolean(stripeSessionId);
	const title = translateAction(action.name, resource.id);
	const buttonLabel = loading ? translateMessage('cancel-order-progress') : title;

	const handleCancel = async () => {
		if (!localRecord) return;
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('refund', refundPayment ? 'true' : 'false');
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: localRecord.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			if (response.data.record) {
				setLocalRecord(response.data.record);
			}
		} catch {
			addNotice({ message: 'status-update-failed', type: 'error' });
		} finally {
			setLoading(false);
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
			<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<Box
					as='label'
					display='flex'
					alignItems='center'
					style={{ gap: 10, cursor: canRefund ? 'pointer' : 'not-allowed' }}
				>
					<input
						type='checkbox'
						checked={refundPayment}
						disabled={isReadOnly || !canRefund}
						onChange={(event) => setRefundPayment(event.target.checked)}
						style={{ width: 16, height: 16 }}
					/>
					<Text>{translateMessage('refund-payment')}</Text>
				</Box>
				{!canRefund ? (
					<Text color='grey60' fontSize='sm'>
						{translateMessage('refund-payment-hint')}
					</Text>
				) : null}
				<Box>
					<Button
						style={{
							borderColor: 'white',
							background: '#facc15',
							color: 'black',
						}}
						variant='contained'
						color='primary'
						onClick={handleCancel}
						disabled={isReadOnly || loading}
					>
						{buttonLabel}
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
