import { useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';

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
	if (document.referrer) {
		return extractFiltersFromUrl(document.referrer);
	}
	return {};
};

export default function OrderCsvExportAction(props: ActionProps) {
	const { action, resource } = props;
	const { translateAction, translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [loading, setLoading] = useState(false);

	const filters = useMemo(() => resolveFilters(), []);

	const handleExport = async () => {
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('filters', JSON.stringify(filters));
			const response = await api.resourceAction({
				resourceId: resource.id,
				actionName: action.name,
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
			setLoading(false);
		}
	};

	return (
		<Box
			variant='white'
			p='xxl'
			borderRadius='xl'
			boxShadow='sm'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Text fontSize='xl' fontWeight='bold' mb='sm'>
				{translateAction(action.name, resource.id)}
			</Text>
			<Text color='grey60' mb='xl'>
				{translateMessage('order-csv-description')}
			</Text>
			<Button
				variant='contained'
				color='primary'
				style={actionButtonStyle}
				onClick={handleExport}
				disabled={loading}
			>
				{loading ? translateMessage('order-csv-exporting') : translateMessage('order-csv-export')}
			</Button>
		</Box>
	);
}
