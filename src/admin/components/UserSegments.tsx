import { useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useTranslation } from 'adminjs';
import { Badge, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';

const api = new ApiClient();

type SegmentUser = {
	id: string;
	name: string;
	email: string | null;
	emailVerified: boolean;
	subscribed: boolean;
	createdAt: string;
	lastOrderAt: string | null;
	lifetimeValue: number | null;
};

type SegmentsPayload = {
	config: {
		inactiveDays: number;
		highSpenderMinLtv: number;
		previewLimit: number;
	};
	counts: {
		subscribed: number;
		verified: number;
		unverified: number;
		inactive: number;
		highSpenders: number | null;
	};
	lists: {
		subscribed: SegmentUser[];
		verified: SegmentUser[];
		unverified: SegmentUser[];
		inactive: SegmentUser[];
		highSpenders: SegmentUser[];
	};
};

const formatDate = (value: string | null) => {
	if (!value) return '-';
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
};

const formatMoney = (value: number | null) => {
	const safeValue = value == null || !Number.isFinite(value) ? 0 : value;
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'UAH',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(safeValue);
	} catch {
		return safeValue.toFixed(2);
	}
};

const getRootPath = () => {
	if (typeof window === 'undefined') return '';
	const path = window.location.pathname ?? '';
	const parts = path.split('/resources');
	return parts[0] ?? '';
};

const buildUserShowHref = (resourceId: string, userId: string) =>
	`${getRootPath()}/resources/${resourceId}/records/${userId}/show`;

const buildUserListHref = (resourceId: string, filters: Record<string, string>) => {
	const root = getRootPath();
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		params.set(`filters.${key}`, value);
	}
	return `${root}/resources/${resourceId}?${params.toString()}`;
};

function UsersTable({
	resourceId,
	users,
	showLastOrder,
	showLtv,
}: {
	resourceId: string;
	users: SegmentUser[];
	showLastOrder?: boolean;
	showLtv?: boolean;
}) {
	const { translateMessage } = useTranslation();

	if (!users.length) {
		return <Text color='grey60'>{translateMessage('user-segments-empty')}</Text>;
	}

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>{translateMessage('user-segments-col-name')}</TableCell>
					<TableCell>{translateMessage('user-segments-col-email')}</TableCell>
					{showLtv ? <TableCell>{translateMessage('user-segments-col-ltv')}</TableCell> : null}
					{showLastOrder ? <TableCell>{translateMessage('user-segments-col-last-order')}</TableCell> : null}
					<TableCell>{translateMessage('user-segments-col-created')}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>
							<a href={buildUserShowHref(resourceId, user.id)} style={{ fontWeight: 600 }}>
								{user.name}
							</a>
						</TableCell>
						<TableCell>{user.email ?? '-'}</TableCell>
						{showLtv ? <TableCell>{formatMoney(user.lifetimeValue)}</TableCell> : null}
						{showLastOrder ? <TableCell>{formatDate(user.lastOrderAt)}</TableCell> : null}
						<TableCell>{formatDate(user.createdAt)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default function UserSegments({ resource }: ActionProps) {
	const { translateMessage } = useTranslation();
	const [payload, setPayload] = useState<SegmentsPayload | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let isActive = true;
		setLoading(true);
		api.resourceAction({
			resourceId: resource.id,
			actionName: 'userSegments',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setPayload((response.data.payload ?? null) as SegmentsPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [resource.id]);

	const previewLimitText = useMemo(() => {
		if (!payload) return '';
		return translateMessage('user-segments-preview', { limit: payload.config.previewLimit });
	}, [payload, translateMessage]);

	if (loading || !payload) {
		return (
			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Text color='grey60'>{translateMessage('user-segments-loading')}</Text>
			</Box>
		);
	}

	return (
		<Box style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Text fontSize='xl' fontWeight='bold' mb='sm'>
					{translateMessage('user-segments-title')}
				</Text>
				<Text color='grey60' mb='md'>
					{translateMessage('user-segments-purpose')}
				</Text>
				<Text color='grey60'>{previewLimitText}</Text>
			</Box>

			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Box>
						<Text fontWeight='bold'>{translateMessage('user-segments-subscribed')}</Text>
						<Text color='grey60'>{translateMessage('user-segments-subscribed-desc')}</Text>
					</Box>
					<Box display='flex' alignItems='center' style={{ gap: 12 }}>
						<Badge outline>{payload.counts.subscribed}</Badge>
						<a href={buildUserListHref(resource.id, { subscribed: 'true' })}>
							<Button variant='outlined'>{translateMessage('user-segments-open')}</Button>
						</a>
					</Box>
				</Box>
				<UsersTable resourceId={resource.id} users={payload.lists.subscribed} />
			</Box>

			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Box>
						<Text fontWeight='bold'>{translateMessage('user-segments-verified')}</Text>
						<Text color='grey60'>{translateMessage('user-segments-verified-desc')}</Text>
					</Box>
					<Box display='flex' alignItems='center' style={{ gap: 12 }}>
						<Badge outline>{payload.counts.verified}</Badge>
						<a href={buildUserListHref(resource.id, { emailVerified: 'true' })}>
							<Button variant='outlined'>{translateMessage('user-segments-open')}</Button>
						</a>
					</Box>
				</Box>
				<UsersTable resourceId={resource.id} users={payload.lists.verified} />
			</Box>

			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Box>
						<Text fontWeight='bold'>{translateMessage('user-segments-unverified')}</Text>
						<Text color='grey60'>{translateMessage('user-segments-unverified-desc')}</Text>
					</Box>
					<Box display='flex' alignItems='center' style={{ gap: 12 }}>
						<Badge outline>{payload.counts.unverified}</Badge>
						<a href={buildUserListHref(resource.id, { emailVerified: 'false' })}>
							<Button variant='outlined'>{translateMessage('user-segments-open')}</Button>
						</a>
					</Box>
				</Box>
				<UsersTable resourceId={resource.id} users={payload.lists.unverified} />
			</Box>

			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Box>
						<Text fontWeight='bold'>{translateMessage('user-segments-high-spenders')}</Text>
						<Text color='grey60'>
							{translateMessage('user-segments-high-spenders-desc', {
								min: String(payload.config.highSpenderMinLtv),
							})}
						</Text>
					</Box>
					<Box display='flex' alignItems='center' style={{ gap: 12 }}>
						<Badge outline>{payload.counts.highSpenders ?? '-'}</Badge>
					</Box>
				</Box>
				<UsersTable resourceId={resource.id} users={payload.lists.highSpenders} showLtv showLastOrder />
			</Box>

			<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
				<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg'>
					<Box>
						<Text fontWeight='bold'>{translateMessage('user-segments-inactive')}</Text>
						<Text color='grey60'>
							{translateMessage('user-segments-inactive-desc', { days: String(payload.config.inactiveDays) })}
						</Text>
					</Box>
					<Box display='flex' alignItems='center' style={{ gap: 12 }}>
						<Badge outline>{payload.counts.inactive}</Badge>
					</Box>
				</Box>
				<UsersTable resourceId={resource.id} users={payload.lists.inactive} showLastOrder />
			</Box>
		</Box>
	);
}
