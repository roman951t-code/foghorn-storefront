import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Badge, Box, Button, FormGroup, Select, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
type StatusOption = { value: OrderStatus; label: string };

const api = new ApiClient();

const statuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
// Mirrors the server's ORDER_STATUS_TRANSITIONS in order-actions.mts —
// DELIVERED has no entry so RETURNED never appears as a selectable option
// here; that transition only happens through the dedicated "Process
// Return" action, which handles the refund and inventory restock.
const statusTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
	PENDING: ['PAID', 'CANCELLED'],
	PAID: ['SHIPPED', 'CANCELLED'],
	SHIPPED: ['DELIVERED', 'CANCELLED'],
	DELIVERED: [],
	CANCELLED: [],
	RETURNED: [],
};

export default function OrderStatusAction({ action, record, resource }: ActionProps) {
	const [localRecord, setLocalRecord] = useState(record);
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
		(record?.params.status as OrderStatus) ?? 'PENDING'
	);
	const [loading, setLoading] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const addNotice = useNotice();
	const { translateAction, translateLabel, translateMessage } = useTranslation();
	const currentStatus = localRecord?.params?.status as OrderStatus | undefined;
	const selectableStatuses = useMemo<OrderStatus[]>(() => {
		if (!currentStatus) return statuses;
		const allowed = new Set<OrderStatus>([currentStatus, ...(statusTransitions[currentStatus] ?? [])]);
		return statuses.filter((status) => allowed.has(status));
	}, [currentStatus]);
	const statusOptions = useMemo<StatusOption[]>(
		() =>
			selectableStatuses.map((status) => ({
				value: status,
				label: translateLabel(`status.${status}`, resource.id),
			})),
		[resource.id, selectableStatuses, translateLabel]
	);
	const currentLabel = currentStatus
		? translateLabel(`status.${currentStatus}`, resource.id)
		: translateMessage('status-unknown');
	const selectedOption =
		statusOptions.find((option) => option.value === selectedStatus) ??
		(currentStatus ? statusOptions.find((option) => option.value === currentStatus) ?? null : null);
	const nextStatus = selectedOption?.value ?? currentStatus ?? null;
	const nextLabel = nextStatus ? translateLabel(`status.${nextStatus}`, resource.id) : null;

	if (!localRecord) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('status-update-failed')}</Text>
			</Box>
		);
	}

	const handleClick = async () => {
		if (!localRecord || !nextStatus) return;
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('status', nextStatus);
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: localRecord.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice?.type === 'error') {
				addNotice(response.data.notice);
			} else {
				addNotice({
					message: 'status-updated',
					type: 'success',
					options: { status: nextLabel ?? nextStatus },
				});
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

	const buttonLabel = loading
		? translateMessage('status-update-progress')
		: translateMessage('apply-status');
	const title = translateAction(action.name, resource.id);

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
			<Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
				<Box display='flex' alignItems='center'>
					<Text fontSize='lg' fontWeight='500' mr='lg'>
						{translateMessage('current-status')}
					</Text>
					<Badge
						fontSize='md'
						outline
						style={{
							background: '#C6F6D5',
							borderColor: '#38A169',
							color: '#22543D',
						}}
					>
						{currentLabel}
					</Badge>
				</Box>
				<FormGroup label={translateMessage('select-status')} mb='0'>
					<Select
						isClearable={false}
						options={statusOptions}
						value={selectedOption}
						onChange={(option: StatusOption | null) => {
							const value = option?.value;
							setSelectedStatus(value ?? currentStatus ?? 'PENDING');
						}}
					/>
				</FormGroup>
				{nextLabel ? (
					<Box display='flex' alignItems='center'>
						<Text fontWeight='500' fontSize='lg' mr='lg'>
							{translateMessage('new-status')}
						</Text>
						<Badge
							fontSize='md'
							outline
							style={{
								background: '#C6F6D5',
								borderColor: '#38A169',
								color: '#22543D',
							}}
						>
							{nextLabel}
						</Badge>
					</Box>
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
						onClick={handleClick}
						disabled={isReadOnly || !nextStatus || loading}
					>
						{buttonLabel}
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
