import { useMemo, useState, type ChangeEvent } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text } from '@adminjs/design-system';

const api = new ApiClient();

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
	padding: '12px 20px',
};

const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'bigint') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		const numeric = (value as any).toNumber();
		return Number.isFinite(numeric) ? numeric : 0;
	}
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : 0;
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

export default function OrderReturnAction({ action, record, resource }: ActionProps) {
	const { translateAction, translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [loading, setLoading] = useState(false);
	const [refundAmount, setRefundAmount] = useState('');
	const [refundReason, setRefundReason] = useState('');

	if (!record) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('return-load-failed')}</Text>
			</Box>
		);
	}

	const total = useMemo(() => toNumber(record.params.total), [record.params.total]);
	const existingRefund = useMemo(() => toNumber(record.params.refundAmount), [record.params.refundAmount]);
	const title = translateAction(action.name, resource.id);

	const handleSubmit = async () => {
		if (!record.id || loading) return;
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('refundAmount', refundAmount);
			formData.append('refundReason', refundReason);
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: record.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) addNotice(response.data.notice);
		} catch {
			addNotice({ message: 'return-save-failed', type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Text fontSize='xl' fontWeight='bold' mb='sm'>
				{title}
			</Text>
			<Text color='grey60' mb='xl'>
				{translateMessage('return-description')}
			</Text>

			<Box mb='xl' style={{ display: 'grid', gap: 12 }}>
				<Text>
					{translateMessage('return-order-total')}: <strong>{formatMoney(total)}</strong>
				</Text>
				<Text color='grey60'>
					{translateMessage('return-refund-existing')}: {formatMoney(existingRefund)}
				</Text>
				<FormGroup>
					<Label>{translateMessage('return-refund-amount')}</Label>
					<Input
						type='number'
						step='0.01'
						placeholder={translateMessage('return-refund-placeholder')}
						value={refundAmount}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setRefundAmount(event.target.value)}
					/>
				</FormGroup>
				<FormGroup>
					<Label>{translateMessage('return-refund-reason')}</Label>
					<Input
						type='text'
						placeholder={translateMessage('return-reason-placeholder')}
						value={refundReason}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setRefundReason(event.target.value)}
					/>
				</FormGroup>
			</Box>

			<Button variant='contained' color='primary' style={actionButtonStyle} onClick={handleSubmit} disabled={loading}>
				{loading ? translateMessage('return-processing') : translateMessage('return-process')}
			</Button>
		</Box>
	);
}
