import { useEffect, useState } from 'react';
import { ApiClient, type ActionProps, useTranslation } from 'adminjs';
import { Badge, Box, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';

const api = new ApiClient();

type InventoryEntry = {
	id: string;
	source: string;
	reason: string;
	previousStock: number;
	nextStock: number;
	delta: number;
	adminEmail: string | null;
	createdAt: string;
};

const extractEntries = (payload: unknown): InventoryEntry[] => {
	if (!payload || typeof payload !== 'object') return [];
	const entries = (payload as { entries?: InventoryEntry[] }).entries;
	return Array.isArray(entries) ? entries : [];
};

export default function ProductInventoryHistory(props: ActionProps) {
	const { record, resource } = props;
	const recordId = record?.id;
	const { translateMessage } = useTranslation();
	const [entries, setEntries] = useState<InventoryEntry[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: 'inventoryAdjustments',
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				setEntries(extractEntries(response.data.payload));
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	const formatDate = (value: string) => {
		const parsed = Date.parse(value);
		if (Number.isNaN(parsed)) return value;
		return new Date(parsed).toLocaleString();
	};

	const renderDelta = (delta: number) => {
		if (delta === 0) return String(delta);
		return delta > 0 ? `+${delta}` : String(delta);
	};

	if (!recordId) return null;

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Text fontSize='xl' fontWeight='bold' mb='md'>
				{translateMessage('inventory-history-title')}
			</Text>
			{loading ? (
				<Text color='grey60'>{translateMessage('inventory-history-loading')}</Text>
			) : entries.length === 0 ? (
				<Text color='grey60'>{translateMessage('inventory-history-empty')}</Text>
			) : (
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{translateMessage('inventory-history-date')}</TableCell>
							<TableCell>{translateMessage('inventory-history-admin')}</TableCell>
							<TableCell>{translateMessage('inventory-history-reason')}</TableCell>
							<TableCell>{translateMessage('inventory-history-from')}</TableCell>
							<TableCell>{translateMessage('inventory-history-to')}</TableCell>
							<TableCell>{translateMessage('inventory-history-delta')}</TableCell>
							<TableCell>{translateMessage('inventory-history-source')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{entries.map((entry) => (
							<TableRow key={entry.id}>
								<TableCell>{formatDate(entry.createdAt)}</TableCell>
								<TableCell>{entry.adminEmail ?? translateMessage('inventory-history-unknown-admin')}</TableCell>
								<TableCell>{entry.reason || '-'}</TableCell>
								<TableCell>{entry.previousStock}</TableCell>
								<TableCell>{entry.nextStock}</TableCell>
								<TableCell>
									<Badge outline>{renderDelta(entry.delta)}</Badge>
								</TableCell>
								<TableCell>{translateMessage(`inventory-history-source-${entry.source}`)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</Box>
	);
}
