import { ApiClient, type ActionProps, OriginalList, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';
import { useState } from 'react';

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const getRootPath = () => {
	if (typeof window === 'undefined') return '';
	const path = window.location.pathname ?? '';
	const parts = path.split('/resources');
	return parts[0] ?? '';
};

const buildListHref = (resourceId: string, filters: Record<string, string>) => {
	const root = getRootPath();
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		params.set(`filters.${key}`, value);
	}
	const query = params.toString();
	return `${root}/resources/${resourceId}${query ? `?${query}` : ''}`;
};

const daysAgoIso = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export default function ProductList(props: ActionProps) {
	const { resource } = props;
	const { translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [exporting, setExporting] = useState(false);

	const api = new ApiClient();

	const downloadText = (content: string, filename: string) => {
		const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	};

	const handleExport = async () => {
		setExporting(true);
		try {
			const response = await api.resourceAction({
				resourceId: resource.id,
				actionName: 'exportProductsCsv',
				method: 'get',
			});
			const payload = response.data.payload as { csv?: string; filename?: string } | undefined;
			const csv = payload?.csv ?? '';
			if (!csv) {
				addNotice({ message: 'product-csv-export-empty', type: 'error' });
				return;
			}
			downloadText(csv, payload?.filename ?? 'products.csv');
		} catch {
			addNotice({ message: 'product-csv-export-failed', type: 'error' });
		} finally {
			setExporting(false);
		}
	};

	const views: Array<{ key: string; filters: Record<string, string> }> = [
		{ key: 'in-stock', filters: { inStock: 'true' } },
		{ key: 'low-stock', filters: { inStock: 'true', stock: JSON.stringify({ lte: 5 }) } },
		{ key: 'discounted', filters: { discountPrice: JSON.stringify({ not: null }) } },
		{ key: 'no-image', filters: { imageUrl: JSON.stringify({ equals: null }) } },
		{ key: 'recently-updated', filters: { updatedAt: JSON.stringify({ gte: daysAgoIso(7) }) } },
		{ key: 'draft', filters: { status: 'DRAFT' } },
	];

	return (
		<Box>
			<Box
				variant='white'
				p='lg'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
			>
				<Text fontWeight='bold'>{translateMessage('product-views-title')}</Text>
				<Box style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
					{views.map((view) => (
						<a key={view.key} href={buildListHref(resource.id, view.filters)}>
							<Button variant='contained' color='primary' style={actionButtonStyle}>
								{translateMessage(`product-views-${view.key}`)}
							</Button>
						</a>
					))}
					<a href={buildListHref(resource.id, {})}>
						<Button variant='outlined'>{translateMessage('product-views-clear')}</Button>
					</a>
					<Button variant='outlined' onClick={handleExport} disabled={exporting}>
						{exporting ? translateMessage('product-csv-exporting') : translateMessage('product-csv-export')}
					</Button>
				</Box>
			</Box>

			<OriginalList {...props} />
		</Box>
	);
}
