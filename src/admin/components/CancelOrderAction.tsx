import { useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';
import { useNavigate } from 'react-router';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();
const STALE_CANCEL_ACTION_ERROR = 'does not have an action with name: cancelOrder';

const appendForceRefresh = (url: string, search?: string) => {
	const searchParamsIdx = url.lastIndexOf('?');
	const urlSearchParams = searchParamsIdx !== -1 ? url.substring(searchParamsIdx + 1) : null;
	const oldParams = new URLSearchParams(search ?? urlSearchParams ?? window.location.search ?? '');
	const newParams = new URLSearchParams(oldParams.toString());
	newParams.set('refresh', 'true');
	const newUrl = searchParamsIdx !== -1 ? url.substring(0, searchParamsIdx) : url;
	return `${newUrl}?${newParams.toString()}`;
};

export default function CancelOrderAction({ action, record, resource }: ActionProps) {
	const [localRecord, setLocalRecord] = useState(record);
	const [refundPayment, setRefundPayment] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
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
			if (response.data.redirectUrl) {
				navigate(appendForceRefresh(response.data.redirectUrl));
				return;
			}
			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			if (response.data.record) {
				setLocalRecord(response.data.record);
			}
		} catch (error) {
			const errorMessage =
				(error as { response?: { data?: { message?: unknown } }; message?: unknown })?.response?.data?.message ??
				(error as { message?: unknown })?.message;
			const normalizedError = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
			if (normalizedError.includes(STALE_CANCEL_ACTION_ERROR.toLowerCase()) || normalizedError.includes('order-not-found')) {
				addNotice({ message: 'order-not-found', type: 'error' });
				navigate(appendForceRefresh(resource.href ?? `/admin/resources/${resource.id}`));
				return;
			}
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
					<Text color='grey60' fontSize='15px'>
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
