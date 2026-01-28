import { useMemo, useState, type ChangeEvent } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import {
	Box,
	Button,
	Input,
	Label,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Text,
} from '@adminjs/design-system';

type CsvResult = {
	row: number;
	status: 'created' | 'updated' | 'skipped' | 'error';
	message?: string;
};

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

export default function ProductCsvImportExportAction(props: ActionProps) {
	const { action, resource } = props;
	const { translateAction, translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [csvText, setCsvText] = useState('');
	const [dryRun, setDryRun] = useState(true);
	const [reason, setReason] = useState('');
	const [results, setResults] = useState<CsvResult[]>([]);
	const [loading, setLoading] = useState(false);

	const summary = useMemo(() => {
		const created = results.filter((r) => r.status === 'created').length;
		const updated = results.filter((r) => r.status === 'updated').length;
		const errors = results.filter((r) => r.status === 'error').length;
		return { created, updated, errors };
	}, [results]);

	const formatStatus = (status: CsvResult['status']) =>
		translateMessage(`product-csv-status-${status}`, { defaultValue: status });

	const handleFile = (file: File | null) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setCsvText(String(reader.result ?? ''));
		};
		reader.readAsText(file);
	};

	const handleExport = async () => {
		setLoading(true);
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
			setLoading(false);
		}
	};

	const handleImport = async () => {
		if (!csvText.trim()) {
			addNotice({ message: 'product-csv-empty', type: 'error' });
			return;
		}
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('csv', csvText);
			formData.append('dryRun', String(dryRun));
			formData.append('reason', reason);
			const response = await api.resourceAction({
				resourceId: resource.id,
				actionName: action.name,
				method: 'post',
				data: formData,
			});
			if (response.data.notice) addNotice(response.data.notice);
			setResults((response.data.payload?.results ?? []) as CsvResult[]);
		} catch {
			addNotice({ message: 'product-csv-import-failed', type: 'error' });
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
				{translateMessage('product-csv-description')}
			</Text>

			<Box mb='xl' style={{ display: 'grid', gap: 12 }}>
				<Label>{translateMessage('product-csv-file-label')}</Label>
				<Input
					type='file'
					accept='.csv,text/csv'
					onChange={(event: ChangeEvent<HTMLInputElement>) => handleFile(event.target.files?.[0] ?? null)}
				/>
				<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<input
						type='checkbox'
						checked={dryRun}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setDryRun(event.target.checked)}
					/>
					<Text>{translateMessage('product-csv-dry-run')}</Text>
				</Box>
				<Box>
					<Label>{translateMessage('product-csv-reason-label')}</Label>
					<Input
						value={reason}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
						placeholder={translateMessage('product-csv-reason-placeholder')}
					/>
				</Box>
				<Box style={{ display: 'flex', gap: 12 }}>
					<Button variant='outlined' onClick={handleExport} disabled={loading}>
						{translateMessage('product-csv-export')}
					</Button>
					<Button variant='contained' color='primary' style={actionButtonStyle} onClick={handleImport} disabled={loading}>
						{loading ? translateMessage('product-csv-importing') : translateMessage('product-csv-import')}
					</Button>
				</Box>
			</Box>

			{results.length > 0 ? (
				<Box>
					<Text fontWeight='bold' mb='md'>
						{translateMessage('product-csv-summary', {
							created: String(summary.created),
							updated: String(summary.updated),
							errors: String(summary.errors),
						})}
					</Text>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{translateMessage('product-csv-row')}</TableCell>
								<TableCell>{translateMessage('product-csv-status')}</TableCell>
								<TableCell>{translateMessage('product-csv-message')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{results.map((result) => (
								<TableRow key={`${result.row}-${result.status}`}>
									<TableCell>{result.row}</TableCell>
									<TableCell>{formatStatus(result.status)}</TableCell>
									<TableCell>{result.message ?? '-'}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Box>
			) : null}
		</Box>
	);
}
