import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, OriginalList, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

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

const extractFiltersFromUrl = (href: string): Record<string, string> => {
	try {
		const url = new URL(href);
		const params = url.searchParams;
		const filters: Record<string, string> = {};
		for (const [key, value] of params.entries()) {
			if (key.startsWith('filters.')) {
				const filterKey = key.slice('filters.'.length);
				if (filterKey) filters[filterKey] = value;
			}
		}
		return filters;
	} catch {
		return {};
	}
};

const resolveFilters = (): Record<string, string> => {
	if (typeof window === 'undefined') return {};
	const current = extractFiltersFromUrl(window.location.href);
	if (Object.keys(current).length) return current;
	if (document.referrer) return extractFiltersFromUrl(document.referrer);
	return {};
};

export default function OrderList(props: ActionProps) {
	const { resource } = props;
	const { translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [exporting, setExporting] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();

	const filters = useMemo(() => resolveFilters(), []);

	const handleExport = async () => {
		setExporting(true);
		try {
			const formData = new FormData();
			formData.append('filters', JSON.stringify(filters));
			const response = await api.resourceAction({
				resourceId: resource.id,
				actionName: 'exportOrdersCsv',
				method: 'post',
				data: formData,
			});
			if (response.data.notice) addNotice(response.data.notice);
			const payload = response.data.payload as { csv?: string; filename?: string } | undefined;
			const csv = payload?.csv ?? '';
			if (!csv) {
				addNotice({ message: 'order-csv-export-empty', type: 'error' });
				return;
			}
			downloadText(csv, payload?.filename ?? 'orders.csv');
		} catch {
			addNotice({ message: 'order-csv-export-failed', type: 'error' });
		} finally {
			setExporting(false);
		}
	};

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
				<Text fontWeight='bold'>{translateMessage('order-views-title')}</Text>
					<Button
						variant='contained'
						color='primary'
						style={actionButtonStyle}
						onClick={handleExport}
						disabled={isReadOnly || exporting}
					>
						{exporting ? translateMessage('order-csv-exporting') : translateMessage('order-csv-export')}
					</Button>
				</Box>

			<OriginalList {...props} />
		</Box>
	);
}
