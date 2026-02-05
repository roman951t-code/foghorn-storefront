import { ApiClient, useTranslation } from 'adminjs';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, H4, H5, Label, Text } from '@adminjs/design-system';

const api = new ApiClient();

type QuickAction = {
	key: string;
	path: string;
};

type LowStockItem = {
	id: string;
	name: string;
	imageUrl: string | null;
	stock: number;
	inStock: boolean;
	status: string;
	updatedAt: string;
};

type LowStockPayload = {
	config: {
		lowThreshold: number;
		criticalThreshold: number;
		limit: number;
		outOfStockLimit: number;
		topProductsLimit: number;
		topProductsRangeDays: number;
	};
	counts: {
		critical: number;
		low: number;
		outOfStock: number;
	};
	items: LowStockItem[];
	outOfStock: {
		items: LowStockItem[];
	};
	topProducts: {
		rangeDays: number;
		items: { productId: string; name: string; quantity: number; revenue: number }[];
	};
};

type DashboardMetricsPayload = {
	sales: {
		today: number;
		last7Days: number;
		last30Days: number;
	};
	salesTrend: {
		days: number;
		points: { day: string; total: number; orders?: number }[];
	};
	ordersTrend: {
		days: number;
		points: { day: string; orders: number; total?: number }[];
	};
	newUsers: {
		last7Days: number;
	};
	newSubscribers: {
		last7Days: number;
		total: number;
	};
	refunds: {
		last30Days: {
			count: number;
			amount: number;
		};
	};
	orderStatusCounts: { status: string; count: number }[];
	topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
};

const quickActions: QuickAction[] = [
	{ key: 'orders', path: 'resources/Order' },
	{ key: 'products', path: 'resources/Product' },
	{ key: 'customers', path: 'resources/User' },
	{ key: 'reviews', path: 'resources/Review' },
];

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
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

const formatCount = (value: number) => {
	const safeValue = Number.isFinite(value) ? value : 0;
	try {
		return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(safeValue);
	} catch {
		return String(Math.trunc(safeValue));
	}
};

const resolvePath = (path: string) => {
	if (typeof window === 'undefined') return path;
	const globalAny = window as typeof window & {
		REDUX_STATE?: { paths?: { rootPath?: string } };
	};
	const rootPath = globalAny.REDUX_STATE?.paths?.rootPath ?? '';
	const normalizedRoot = rootPath.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\//, '');
	if (!normalizedRoot) return path;
	return `${normalizedRoot}/${normalizedPath}`;
};

const goTo = (path: string) => () => {
	if (typeof window !== 'undefined') {
		window.location.assign(resolvePath(path));
	}
};

export default function Dashboard() {
	const { translateLabel, translateMessage } = useTranslation();
	const [metrics, setMetrics] = useState<DashboardMetricsPayload | null>(null);
	const [metricsLoading, setMetricsLoading] = useState(false);
	const [metricsError, setMetricsError] = useState(false);
	const [lowInput, setLowInput] = useState('5');
	const [criticalInput, setCriticalInput] = useState('2');
	const [lowStockPayload, setLowStockPayload] = useState<LowStockPayload | null>(null);
	const [lowStockLoading, setLowStockLoading] = useState(false);

	const lowThreshold = useMemo(() => Math.max(0, Math.trunc(Number(lowInput))), [lowInput]);
	const criticalThreshold = useMemo(() => Math.max(0, Math.trunc(Number(criticalInput))), [criticalInput]);
	const thresholdsValid =
		Number.isFinite(lowThreshold) &&
		Number.isFinite(criticalThreshold) &&
		lowInput.trim() !== '' &&
		criticalInput.trim() !== '' &&
		criticalThreshold <= lowThreshold;

	const resolveStatusLabel = (status: string) => {
		if (!status) return '-';
		const translated = translateLabel(`status.${status}`, 'Product');
		return translated && translated !== `status.${status}` ? translated : status;
	};

	const resolveInStockLabel = (value: boolean) => {
		const key = `inStock.${value ? 'true' : 'false'}`;
		const translated = translateLabel(key, 'Product');
		return translated && translated !== key ? translated : value ? 'Yes' : 'No';
	};

	const resolveOrderStatusLabel = (status: string) => {
		if (!status) return '-';
		const translated = translateLabel(`status.${status}`, 'Order');
		return translated && translated !== `status.${status}` ? translated : status;
	};

	const lowStockListHref = useMemo(() => {
		const params = new URLSearchParams();
		params.set('filters.stock', JSON.stringify({ lte: lowThreshold }));
		return resolvePath(`resources/Product?${params.toString()}`);
	}, [lowThreshold]);

	const fetchMetrics = () => {
		let isActive = true;
		setMetricsLoading(true);
		setMetricsError(false);
			api.getDashboard()
				.then((response) => {
					if (!isActive) return;
					setMetrics(((response.data as any)?.payload ?? null) as DashboardMetricsPayload | null);
				})
				.catch(() => {
					if (!isActive) return;
					setMetrics(null);
				setMetricsError(true);
			})
			.finally(() => {
				if (!isActive) return;
				setMetricsLoading(false);
			});
		return () => {
			isActive = false;
		};
	};

	useEffect(() => {
		const cleanup = fetchMetrics();
		return cleanup;
	}, []);

	const fetchLowStock = async (override?: { low: number; critical: number }) => {
		const nextLow = override?.low ?? lowThreshold;
		const nextCritical = override?.critical ?? criticalThreshold;
		setLowStockLoading(true);
		try {
			const formData = new FormData();
			formData.append('lowThreshold', String(nextLow));
			formData.append('criticalThreshold', String(nextCritical));
			const response = await api.resourceAction({
				resourceId: 'Product',
				actionName: 'lowStockAlerts',
				method: 'post',
				data: formData,
			});
			const nextPayload = (response.data.payload ?? null) as LowStockPayload | null;
			setLowStockPayload(nextPayload);
			if (nextPayload?.config) {
				setLowInput(String(nextPayload.config.lowThreshold));
				setCriticalInput(String(nextPayload.config.criticalThreshold));
			}
		} finally {
			setLowStockLoading(false);
		}
	};

	useEffect(() => {
		fetchLowStock({ low: lowThreshold, critical: Math.min(lowThreshold, criticalThreshold) });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const statusCounts = metrics?.orderStatusCounts ?? [];
	const statusMax = useMemo(() => {
		if (!statusCounts.length) return 0;
		return Math.max(...statusCounts.map((item) => item.count));
	}, [statusCounts]);

	const topProducts = metrics?.topProducts ?? [];
	const topProductMax = useMemo(() => {
		if (!topProducts.length) return 0;
		return Math.max(...topProducts.map((item) => item.quantity));
	}, [topProducts]);

	const outOfStockItems = lowStockPayload?.outOfStock?.items ?? [];
	const topProductItems = lowStockPayload?.topProducts?.items ?? [];
	const topProductsRangeDays =
		lowStockPayload?.topProducts?.rangeDays ?? lowStockPayload?.config.topProductsRangeDays ?? 30;

	const salesTrendPoints = metrics?.salesTrend?.points ?? [];
	const salesTrendMax = useMemo(() => {
		if (!salesTrendPoints.length) return 0;
		return Math.max(...salesTrendPoints.map((p) => p.total));
	}, [salesTrendPoints]);

	const ordersTrendPoints = metrics?.ordersTrend?.points ?? [];
	const ordersTrendMax = useMemo(() => {
		if (!ordersTrendPoints.length) return 0;
		return Math.max(...ordersTrendPoints.map((p) => p.orders));
	}, [ordersTrendPoints]);

	const formatShortDay = (isoDate: string) => {
		const d = new Date(`${isoDate}T00:00:00.000Z`);
		if (Number.isNaN(d.getTime())) return isoDate;
		try {
			return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
		} catch {
			return isoDate.slice(5);
		}
	};

	return (
		<Box variant='grey' p='xxl'>
			<Box mt='xxl'>
				<H4>{translateMessage('dashboard.dailyFocus.title')}</H4>
				<Text color='grey60'>{translateMessage('dashboard.dailyFocus.subtitle')}</Text>
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: 16,
				}}
			>
				{quickActions.map((action) => (
					<Box
						key={action.key}
						variant='white'
						p='xl'
						borderRadius='xl'
						boxShadow='sm'
						style={{ border: '1px solid #E2E8F0' }}
					>
						<H5 mb='md'>{translateMessage(`dashboard.cards.${action.key}.title`)}</H5>
						<Text color='grey60' mb='xl'>
							{translateMessage(`dashboard.cards.${action.key}.description`)}
						</Text>
						<Button
							variant='contained'
							color='primary'
							style={actionButtonStyle}
							onClick={goTo(action.path)}
						>
							{translateMessage(`dashboard.cards.${action.key}.button`)}
						</Button>
					</Box>
				))}
			</Box>

			<Box mt='xxl'>
				<Box display='flex' alignItems='center' justifyContent='space-between' style={{ gap: 16, flexWrap: 'wrap' }}>
					<Box>
						<H4>{translateMessage('dashboard.performance.title')}</H4>
						<Text color='grey60'>{translateMessage('dashboard.performance.subtitle')}</Text>
					</Box>
					<Button variant='outlined' onClick={fetchMetrics} disabled={metricsLoading}>
						{translateMessage('dashboard.metrics.refresh')}
					</Button>
				</Box>
				{metricsLoading ? (
					<Text color='grey60' mt='md'>
						{translateMessage('dashboard.metrics.loading')}
					</Text>
				) : metricsError ? (
					<Text color='grey60' mt='md'>
						{translateMessage('dashboard.metrics.error')}
					</Text>
				) : null}
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: 16,
				}}
			>
				{[
					{
						label: translateMessage('dashboard.kpis.salesToday'),
						value: metrics ? formatMoney(metrics.sales.today) : '-',
					},
					{
						label: translateMessage('dashboard.kpis.sales7Days'),
						value: metrics ? formatMoney(metrics.sales.last7Days) : '-',
					},
					{
						label: translateMessage('dashboard.kpis.sales30Days'),
						value: metrics ? formatMoney(metrics.sales.last30Days) : '-',
					},
					{
						label: translateMessage('dashboard.kpis.newUsers7Days'),
						value: metrics ? formatCount(metrics.newUsers.last7Days) : '-',
					},
					{
						label: translateMessage('dashboard.kpis.newSubscribers7Days'),
						value: metrics ? formatCount(metrics.newSubscribers.last7Days) : '-',
					},
					{
						label: translateMessage('dashboard.kpis.totalSubscribers'),
						value: metrics ? formatCount(metrics.newSubscribers.total) : '-',
					},
						{
							label: translateMessage('dashboard.kpis.refunds30Days'),
							value: metrics ? formatMoney(metrics.refunds.last30Days.amount) : '-',
							secondary: metrics
								? translateMessage('dashboard.kpis.refundsCount', {
										count: metrics.refunds.last30Days.count,
									})
								: '-',
						},
					].map((item) => (
					<Box
						key={item.label}
						variant='white'
						p='lg'
						borderRadius='xl'
						boxShadow='sm'
						style={{ border: '1px solid #E2E8F0' }}
					>
						<Text color='grey60' fontSize='sm' mb='xs'>
							{item.label}
						</Text>
						<Text fontSize='xl' fontWeight='bold'>
							{item.value}
						</Text>
						{item.secondary ? (
							<Text color='grey60' fontSize='sm'>
								{item.secondary}
							</Text>
						) : null}
					</Box>
				))}
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 16,
				}}
			>
				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.charts.orderStatus.title')}
					</Text>
					<Text color='grey60' mb='lg'>
						{translateMessage('dashboard.charts.orderStatus.subtitle')}
					</Text>
					{metricsLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.metrics.loading')}</Text>
					) : statusMax === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.charts.orderStatus.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 10 }}>
							{statusCounts.map((item) => {
								const width = statusMax > 0 ? Math.round((item.count / statusMax) * 100) : 0;
								return (
									<Box key={item.status} style={{ display: 'grid', gap: 6 }}>
										<Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
											<Text>{resolveOrderStatusLabel(item.status)}</Text>
											<Text fontWeight='bold'>{formatCount(item.count)}</Text>
										</Box>
										<Box
											style={{
												height: 8,
												borderRadius: 999,
												background: '#E2E8F0',
												overflow: 'hidden',
											}}
										>
											<Box
												style={{
													height: '100%',
													width: `${width}%`,
													background: '#FACC15',
												}}
											/>
										</Box>
									</Box>
								);
							})}
						</Box>
					)}
				</Box>

				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.charts.topProducts.title')}
					</Text>
					<Text color='grey60' mb='lg'>
						{translateMessage('dashboard.charts.topProducts.subtitle')}
					</Text>
					{metricsLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.metrics.loading')}</Text>
					) : topProducts.length === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.charts.topProducts.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 12 }}>
							{topProducts.map((item) => {
								const width = topProductMax > 0 ? Math.round((item.quantity / topProductMax) * 100) : 0;
								return (
									<Box key={item.productId} style={{ display: 'grid', gap: 6 }}>
										<Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
											<a
												href={resolvePath(`resources/Product/records/${item.productId}/show`)}
												style={{ fontWeight: 600 }}
											>
												{item.name}
											</a>
											<Text fontWeight='bold'>{formatMoney(item.revenue)}</Text>
										</Box>
										<Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
												<Text color='grey60'>
													{translateMessage('dashboard.charts.topProducts.units', {
														count: item.quantity,
													})}
												</Text>
											</Box>
										<Box
											style={{
												height: 8,
												borderRadius: 999,
												background: '#E2E8F0',
												overflow: 'hidden',
											}}
										>
											<Box
												style={{
													height: '100%',
													width: `${width}%`,
													background: '#0EA5E9',
												}}
											/>
										</Box>
									</Box>
								);
							})}
						</Box>
					)}
				</Box>
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 16,
				}}
			>
				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.charts.salesTrend.title')}
					</Text>
					<Text color='grey60' mb='lg'>
						{translateMessage('dashboard.charts.salesTrend.subtitle', {
							days: formatCount(metrics?.salesTrend?.days ?? 14),
						})}
					</Text>
					{metricsLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.metrics.loading')}</Text>
					) : salesTrendPoints.length === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.charts.salesTrend.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 10 }}>
							<Box
								style={{
									display: 'grid',
									gridTemplateColumns: `repeat(${salesTrendPoints.length}, 1fr)`,
									gap: 6,
									alignItems: 'end',
									height: 120,
								}}
							>
								{salesTrendPoints.map((p) => {
									const height = salesTrendMax > 0 ? Math.round((p.total / salesTrendMax) * 100) : 0;
									return (
										<Box
											key={p.day}
											title={`${p.day}: ${formatMoney(p.total)}`}
											style={{
												height: `${Math.max(3, height)}%`,
												borderRadius: 8,
												background: '#FACC15',
											}}
										/>
									);
								})}
							</Box>
							<Box
								style={{
									display: 'grid',
									gridTemplateColumns: `repeat(${salesTrendPoints.length}, 1fr)`,
									gap: 6,
								}}
							>
								{salesTrendPoints.map((p, idx) => (
									<Text
										key={p.day}
										color='grey60'
										style={{
											fontSize: 12,
											textAlign: 'center',
											opacity: idx % 2 === 0 ? 1 : 0,
										}}
									>
										{formatShortDay(p.day)}
									</Text>
								))}
							</Box>
						</Box>
					)}
				</Box>

				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.charts.ordersTrend.title')}
					</Text>
					<Text color='grey60' mb='lg'>
						{translateMessage('dashboard.charts.ordersTrend.subtitle', {
							days: formatCount(metrics?.ordersTrend?.days ?? 14),
						})}
					</Text>
					{metricsLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.metrics.loading')}</Text>
					) : ordersTrendPoints.length === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.charts.ordersTrend.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 10 }}>
							<Box
								style={{
									display: 'grid',
									gridTemplateColumns: `repeat(${ordersTrendPoints.length}, 1fr)`,
									gap: 6,
									alignItems: 'end',
									height: 120,
								}}
							>
								{ordersTrendPoints.map((p) => {
									const height = ordersTrendMax > 0 ? Math.round((p.orders / ordersTrendMax) * 100) : 0;
									return (
										<Box
											key={p.day}
											title={`${p.day}: ${formatCount(p.orders)}`}
											style={{
												height: `${Math.max(3, height)}%`,
												borderRadius: 8,
												background: '#0EA5E9',
											}}
										/>
									);
								})}
							</Box>
							<Box
								style={{
									display: 'grid',
									gridTemplateColumns: `repeat(${ordersTrendPoints.length}, 1fr)`,
									gap: 6,
								}}
							>
								{ordersTrendPoints.map((p, idx) => (
									<Text
										key={p.day}
										color='grey60'
										style={{
											fontSize: 12,
											textAlign: 'center',
											opacity: idx % 2 === 0 ? 1 : 0,
										}}
									>
										{formatShortDay(p.day)}
									</Text>
								))}
							</Box>
						</Box>
					)}
				</Box>
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 16,
				}}
			>
				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.widgets.outOfStock.title')}
					</Text>
						<Text color='grey60' mb='lg'>
							{translateMessage('dashboard.widgets.outOfStock.subtitle', {
								count: lowStockPayload?.counts.outOfStock ?? 0,
							})}
						</Text>
					{lowStockLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.lowStock.loading')}</Text>
					) : outOfStockItems.length === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.widgets.outOfStock.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 12 }}>
							{outOfStockItems.map((item) => (
								<Box key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
									<Box style={{ minWidth: 0 }}>
										<a
											href={resolvePath(`resources/Product/records/${item.id}/show`)}
											style={{ fontWeight: 600, display: 'block' }}
										>
											{item.name}
										</a>
										<Text color='grey60' style={{ fontSize: 13 }}>
											{resolveStatusLabel(item.status)}
										</Text>
									</Box>
									<Text fontWeight='bold'>{formatCount(item.stock)}</Text>
								</Box>
							))}
						</Box>
					)}
				</Box>

				<Box variant='white' p='xl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Text fontSize='lg' fontWeight='bold' mb='xs'>
						{translateMessage('dashboard.widgets.topProducts.title')}
					</Text>
					<Text color='grey60' mb='lg'>
						{translateMessage('dashboard.widgets.topProducts.subtitle', {
							days: formatCount(topProductsRangeDays),
						})}
					</Text>
					{lowStockLoading ? (
						<Text color='grey60'>{translateMessage('dashboard.lowStock.loading')}</Text>
					) : topProductItems.length === 0 ? (
						<Text color='grey60'>{translateMessage('dashboard.widgets.topProducts.empty')}</Text>
					) : (
						<Box style={{ display: 'grid', gap: 12 }}>
							{topProductItems.map((item) => (
								<Box key={item.productId} style={{ display: 'grid', gap: 6 }}>
									<Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
										<a
											href={resolvePath(`resources/Product/records/${item.productId}/show`)}
											style={{ fontWeight: 600 }}
										>
											{item.name}
										</a>
										<Text fontWeight='bold'>{formatMoney(item.revenue)}</Text>
									</Box>
									<Text color='grey60' style={{ fontSize: 13 }}>
										{translateMessage('dashboard.widgets.topProducts.units', {
											count: item.quantity,
										})}
									</Text>
								</Box>
							))}
						</Box>
					)}
				</Box>
			</Box>

			<Box mt='xxl'>
				<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
					<Box display='flex' alignItems='center' justifyContent='space-between' mb='lg' style={{ gap: 16, flexWrap: 'wrap' }}>
						<Box>
							<Text fontSize='xl' fontWeight='bold'>
								{translateMessage('dashboard.lowStock.title')}
							</Text>
							<Text color='grey60'>{translateMessage('dashboard.lowStock.subtitle')}</Text>
						</Box>
						<Box display='flex' alignItems='center' style={{ gap: 12 }}>
							<Button
								variant='outlined'
								onClick={() => fetchLowStock()}
								disabled={!thresholdsValid || lowStockLoading}
							>
								{translateMessage('dashboard.lowStock.apply')}
							</Button>
							<a href={lowStockListHref}>
								<Button variant='outlined'>{translateMessage('dashboard.lowStock.openList')}</Button>
							</a>
						</Box>
					</Box>

					<Box
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
							gap: 12,
							marginBottom: 18,
						}}
					>
						<Box>
							<Label>{translateMessage('dashboard.lowStock.criticalThreshold')}</Label>
							<input
								type='number'
								min='0'
								step='1'
								value={criticalInput}
								onChange={(event) => setCriticalInput(event.target.value)}
								style={{
									width: '100%',
									padding: '10px 12px',
									borderRadius: 8,
									border: '1px solid #E2E8F0',
									fontSize: 14,
									marginTop: 8,
								}}
							/>
						</Box>
						<Box>
							<Label>{translateMessage('dashboard.lowStock.lowThreshold')}</Label>
							<input
								type='number'
								min='0'
								step='1'
								value={lowInput}
								onChange={(event) => setLowInput(event.target.value)}
								style={{
									width: '100%',
									padding: '10px 12px',
									borderRadius: 8,
									border: '1px solid #E2E8F0',
									fontSize: 14,
									marginTop: 8,
								}}
							/>
						</Box>
					</Box>

					{lowStockLoading || !lowStockPayload ? (
						<Text color='grey60'>{translateMessage('dashboard.lowStock.loading')}</Text>
					) : (
						<Box>
							<Box display='flex' alignItems='center' style={{ gap: 12, flexWrap: 'wrap' }} mb='lg'>
								<Badge outline>
									{translateMessage('dashboard.lowStock.counts.critical')}: {lowStockPayload.counts.critical}
								</Badge>
								<Badge outline>
									{translateMessage('dashboard.lowStock.counts.low')}: {lowStockPayload.counts.low}
								</Badge>
								<Badge outline>
									{translateMessage('dashboard.lowStock.counts.outOfStock')}: {lowStockPayload.counts.outOfStock}
								</Badge>
							</Box>

							{lowStockPayload.items.length === 0 ? (
								<Text color='grey60'>{translateMessage('dashboard.lowStock.empty')}</Text>
							) : (
								<Box style={{ display: 'grid', gap: 10 }}>
									{lowStockPayload.items.map((item) => (
										<Box
											key={item.id}
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												gap: 12,
												padding: '12px 14px',
												borderRadius: 10,
												border: '1px solid #E2E8F0',
											}}
										>
											<Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
												<Box
													style={{
														width: 50,
														height: 50,
														borderRadius: 10,
														overflow: 'hidden',
														background: '#F1F5F9',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														flexShrink: 0,
													}}
												>
													{item.imageUrl ? (
														<img
															src={item.imageUrl}
															alt={item.name}
															loading='lazy'
															style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
														/>
													) : (
														<Text fontWeight='bold' color='grey60'>
															{item.name?.slice(0, 1) ?? '?'}
														</Text>
													)}
												</Box>
												<Box style={{ minWidth: 0 }}>
													<a
														href={resolvePath(`resources/Product/records/${item.id}/show`)}
														style={{ fontWeight: 600, display: 'block' }}
													>
														{item.name}
													</a>
													<Text color='grey60' style={{ fontSize: 13 }}>
														{resolveStatusLabel(item.status)}
													</Text>
												</Box>
											</Box>
											<Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
												<Box>
													<Text color='grey60' style={{ fontSize: 13 }}>
														{translateMessage('dashboard.lowStock.headers.stock')}
													</Text>
													<Text fontWeight='bold'>{item.stock}</Text>
												</Box>
												<Box>
													<Text color='grey60' style={{ fontSize: 13 }}>
														{translateMessage('dashboard.lowStock.headers.inStock')}
													</Text>
													<Text fontWeight='bold'>{resolveInStockLabel(item.inStock)}</Text>
												</Box>
											</Box>
										</Box>
									))}
								</Box>
							)}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
