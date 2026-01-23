import { useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, OriginalShow, useNotice, useTranslation } from 'adminjs';
import {
	Badge,
	Box,
	Button,
	FormGroup,
	Label,
	Select,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Text,
} from '@adminjs/design-system';

const api = new ApiClient();

type UserKpisPayload = {
	totalOrders: number;
	lifetimeValue: number;
	averageOrderValue: number;
	lastOrderDate: string | null;
};

type UserAdminStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
type StatusOption = { value: UserAdminStatus; label: string };

type UserRelatedPayload = {
	orders: { id: string; status: string; total: number; createdAt: string }[];
	reviews: {
		id: string;
		rating: number;
		comment: string;
		createdAt: string;
		productId: string;
		productName: string;
	}[];
	wishlist: { productId: string; productName: string; createdAt: string }[];
	recentlyViewed: { productId: string; productName: string; createdAt: string }[];
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

const formatDate = (value: string | null) => {
	if (!value) return '-';
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
};

const getRootPath = () => {
	if (typeof window === 'undefined') return '';
	const path = window.location.pathname ?? '';
	const parts = path.split('/resources');
	return parts[0] ?? '';
};

const buildRecordShowHref = (resourceId: string, recordId: string) =>
	`${getRootPath()}/resources/${resourceId}/records/${recordId}/show`;

export default function UserShow(props: ActionProps) {
	const { record, resource } = props;
	const recordId = record?.id;
	const { translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [payload, setPayload] = useState<UserKpisPayload | null>(null);
	const [loading, setLoading] = useState(false);
	const [related, setRelated] = useState<UserRelatedPayload | null>(null);
	const [relatedLoading, setRelatedLoading] = useState(false);
	const [localRecord, setLocalRecord] = useState(record);
	const [adminStatus, setAdminStatus] = useState<UserAdminStatus>('ACTIVE');
	const [adminNotes, setAdminNotes] = useState('');
	const [savingMeta, setSavingMeta] = useState(false);

	useEffect(() => {
		setLocalRecord(record);
		const nextStatus = (record?.params?.adminStatus as UserAdminStatus | undefined) ?? 'ACTIVE';
		const nextNotes = (record?.params?.adminNotes as string | undefined) ?? '';
		setAdminStatus(nextStatus);
		setAdminNotes(nextNotes);
	}, [record?.id]);

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'userKpis',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setPayload((response.data.payload ?? null) as UserKpisPayload | null);
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
		setRelatedLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'userRelatedData',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setRelated((response.data.payload ?? null) as UserRelatedPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setRelatedLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	const statusOptions = useMemo<StatusOption[]>(
		() => [
			{ value: 'ACTIVE', label: translateMessage('user-status-active') },
			{ value: 'SUSPENDED', label: translateMessage('user-status-suspended') },
			{ value: 'BLOCKED', label: translateMessage('user-status-blocked') },
		],
		[translateMessage]
	);
	const selectedStatusOption =
		statusOptions.find((option) => option.value === adminStatus) ?? statusOptions[0] ?? null;

	const lastOrderText = useMemo(() => {
		if (!payload?.lastOrderDate) return '-';
		const parsed = Date.parse(payload.lastOrderDate);
		return Number.isNaN(parsed) ? payload.lastOrderDate : new Date(parsed).toLocaleString();
	}, [payload?.lastOrderDate]);

	const statusBadgeStyle = useMemo(() => {
		if (adminStatus === 'BLOCKED') {
			return { background: '#FED7D7', borderColor: '#E53E3E', color: '#742A2A' };
		}
		if (adminStatus === 'SUSPENDED') {
			return { background: '#FEEBC8', borderColor: '#DD6B20', color: '#7B341E' };
		}
		return { background: '#C6F6D5', borderColor: '#38A169', color: '#22543D' };
	}, [adminStatus]);

	const isDirty = useMemo(() => {
		const baseStatus = (localRecord?.params?.adminStatus as UserAdminStatus | undefined) ?? 'ACTIVE';
		const baseNotes = (localRecord?.params?.adminNotes as string | undefined) ?? '';
		return adminStatus !== baseStatus || adminNotes !== baseNotes;
	}, [adminStatus, adminNotes, localRecord?.params?.adminNotes, localRecord?.params?.adminStatus]);

	const handleSaveMeta = async () => {
		if (!localRecord?.id || savingMeta) return;
		setSavingMeta(true);
		try {
			const formData = new FormData();
			formData.append('adminStatus', adminStatus);
			formData.append('adminNotes', adminNotes);
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: localRecord.id,
				actionName: 'updateUserAdminMeta',
				method: 'post',
				data: formData,
			});
			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			if (response.data.record) {
				setLocalRecord(response.data.record);
				setAdminStatus(
					((response.data.record?.params?.adminStatus as UserAdminStatus | undefined) ?? 'ACTIVE')
				);
				setAdminNotes((response.data.record?.params?.adminNotes as string | undefined) ?? '');
			}
		} catch {
			addNotice({ message: 'user-admin-update-failed', type: 'error' });
		} finally {
			setSavingMeta(false);
		}
	};

	return (
		<Box>
			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Text fontWeight='bold' mb='lg'>
					{translateMessage('customer-flags')}
				</Text>

				<Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
					<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
						<Text color='grey60' mb='sm'>
							{translateMessage('customer-status')}
						</Text>
						<Box display='flex' alignItems='center' justifyContent='space-between'>
							<Badge fontSize='md' outline style={statusBadgeStyle}>
								{selectedStatusOption?.label ?? adminStatus}
							</Badge>
						</Box>
						<Box mt='md'>
							<FormGroup label={translateMessage('customer-status-change')} mb='0'>
								<Select
									isClearable={false}
									options={statusOptions}
									value={selectedStatusOption}
									onChange={(option: StatusOption | null) => {
										const value = option?.value ?? 'ACTIVE';
										setAdminStatus(value);
									}}
								/>
							</FormGroup>
						</Box>
					</Box>

					<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
						<Label htmlFor='admin-notes'>{translateMessage('customer-internal-notes')}</Label>
						<textarea
							id='admin-notes'
							value={adminNotes}
							onChange={(event) => setAdminNotes(event.target.value)}
							placeholder={translateMessage('customer-internal-notes-placeholder')}
							rows={5}
							style={{
								width: '100%',
								resize: 'vertical',
								padding: '12px 14px',
								borderRadius: 8,
								border: '1px solid #E2E8F0',
								fontSize: 14,
								marginTop: 12,
							}}
						/>
					</Box>
				</Box>

				<Box mt='xl' display='flex' style={{ gap: 12, flexWrap: 'wrap' }}>
					<Button
						style={{ borderColor: 'white', background: '#facc15', color: 'black' }}
						variant='contained'
						color='primary'
						onClick={handleSaveMeta}
						disabled={!isDirty || savingMeta}
					>
						{savingMeta ? translateMessage('customer-flags-saving') : translateMessage('customer-flags-save')}
					</Button>
				</Box>
			</Box>

			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				className='admin-card--kpis'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Text fontWeight='bold' mb='lg'>{translateMessage('customer-kpis')}</Text>
				{loading || !payload ? (
					<Text color='grey60'>{translateMessage('customer-kpis-loading')}</Text>
				) : (
					<Box
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
							gap: 16,
						}}
					>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>
								{translateMessage('customer-kpis-total-orders')}
							</Text>
							<Text fontWeight='bold'>{payload.totalOrders}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>
								{translateMessage('customer-kpis-ltv')}
							</Text>
							<Text fontWeight='bold'>{formatMoney(payload.lifetimeValue)}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>
								{translateMessage('customer-kpis-aov')}
							</Text>
							<Text fontWeight='bold'>{formatMoney(payload.averageOrderValue)}</Text>
						</Box>
						<Box style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
							<Text color='grey60'>
								{translateMessage('customer-kpis-last-order')}
							</Text>
							<Text fontWeight='bold'>{lastOrderText}</Text>
						</Box>
					</Box>
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
					{translateMessage('customer-related')}
				</Text>
				{relatedLoading || !related ? (
					<Text color='grey60'>{translateMessage('customer-related-loading')}</Text>
				) : (
					<Box style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('customer-related-orders')}
							</Text>
							{related.orders.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('customer-related-order-id')}</TableCell>
											<TableCell>{translateMessage('customer-related-order-status')}</TableCell>
											<TableCell>{translateMessage('customer-related-order-total')}</TableCell>
											<TableCell>{translateMessage('customer-related-order-created')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.orders.map((order) => (
											<TableRow key={order.id}>
												<TableCell>
													<a href={buildRecordShowHref('Order', order.id)} style={{ fontWeight: 600 }}>
														{order.id}
													</a>
												</TableCell>
												<TableCell>{order.status}</TableCell>
												<TableCell>{formatMoney(order.total)}</TableCell>
												<TableCell>{formatDate(order.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('customer-related-empty')}</Text>
							)}
						</Box>

						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('customer-related-reviews')}
							</Text>
							{related.reviews.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('customer-related-review-product')}</TableCell>
											<TableCell>{translateMessage('customer-related-review-rating')}</TableCell>
											<TableCell>{translateMessage('customer-related-review-comment')}</TableCell>
											<TableCell>{translateMessage('customer-related-review-created')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.reviews.map((review) => (
											<TableRow key={review.id}>
												<TableCell>
													<a href={buildRecordShowHref('Product', review.productId)} style={{ fontWeight: 600 }}>
														{review.productName}
													</a>
												</TableCell>
												<TableCell>{review.rating}</TableCell>
												<TableCell>
													<Text
														style={{
															maxWidth: 420,
															whiteSpace: 'nowrap',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
														}}
													>
														{review.comment}
													</Text>
												</TableCell>
												<TableCell>{formatDate(review.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('customer-related-empty')}</Text>
							)}
						</Box>

						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('customer-related-wishlist')}
							</Text>
							{related.wishlist.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('customer-related-product')}</TableCell>
											<TableCell>{translateMessage('customer-related-added')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.wishlist.map((item) => (
											<TableRow key={`${item.productId}:${item.createdAt}`}>
												<TableCell>
													<a href={buildRecordShowHref('Product', item.productId)} style={{ fontWeight: 600 }}>
														{item.productName}
													</a>
												</TableCell>
												<TableCell>{formatDate(item.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('customer-related-empty')}</Text>
							)}
						</Box>

						<Box>
							<Text fontWeight='bold' mb='sm'>
								{translateMessage('customer-related-recently-viewed')}
							</Text>
							{related.recentlyViewed.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>{translateMessage('customer-related-product')}</TableCell>
											<TableCell>{translateMessage('customer-related-updated')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{related.recentlyViewed.map((item) => (
											<TableRow key={`${item.productId}:${item.createdAt}`}>
												<TableCell>
													<a href={buildRecordShowHref('Product', item.productId)} style={{ fontWeight: 600 }}>
														{item.productName}
													</a>
												</TableCell>
												<TableCell>{formatDate(item.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<Text color='grey60'>{translateMessage('customer-related-empty')}</Text>
							)}
						</Box>
					</Box>
				)}
			</Box>

			<OriginalShow {...props} />
		</Box>
	);
}
