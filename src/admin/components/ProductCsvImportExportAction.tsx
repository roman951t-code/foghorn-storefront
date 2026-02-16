import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import * as XLSX from 'xlsx';
import {
	Box,
	Button,
	Icon,
	Input,
	Label,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Text,
} from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

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

const PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const PRODUCT_CSV_IMPORT_MAX_ROW_COUNT = 5000;
const PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_MB = (
	PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES /
	(1024 * 1024)
).toString();

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

const parseCsvRows = (input: string): string[][] => {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let inQuotes = false;
	for (let i = 0; i < input.length; i += 1) {
		const char = input[i];
		const next = input[i + 1];
		if (char === '"') {
			if (inQuotes && next === '"') {
				cell += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}
		if (char === ',' && !inQuotes) {
			row.push(cell);
			cell = '';
			continue;
		}
		if ((char === '\n' || char === '\r') && !inQuotes) {
			if (char === '\r' && next === '\n') i += 1;
			row.push(cell);
			cell = '';
			if (row.some((entry) => entry.trim() !== '')) rows.push(row);
			row = [];
			continue;
		}
		cell += char;
	}
	row.push(cell);
	if (row.some((entry) => entry.trim() !== '')) rows.push(row);
	return rows;
};

const countSpreadsheetRows = (buffer: ArrayBuffer) => {
	const workbook = XLSX.read(buffer, { type: 'array' });
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) return 0;
	const sheet = workbook.Sheets[firstSheetName];
	if (!sheet) return 0;
	const rows = XLSX.utils.sheet_to_json(sheet, {
		header: 1,
		raw: false,
		defval: '',
	}) as unknown[][];
	return rows
		.map((row) => row.map((cell) => String(cell ?? '')))
		.filter((row) => row.some((entry) => entry.trim().length > 0)).length;
};

export default function ProductCsvImportExportAction(props: ActionProps) {
	const { action, resource } = props;
	const { translateAction, translateMessage } = useTranslation();
	const addNotice = useNotice();
	const [csvText, setCsvText] = useState('');
	const [spreadsheetBase64, setSpreadsheetBase64] = useState('');
	const [uploadFilename, setUploadFilename] = useState('');
	const [dryRun, setDryRun] = useState(true);
	const [reason, setReason] = useState('');
	const [results, setResults] = useState<CsvResult[]>([]);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const isBusy = isExporting || isImporting;
	const exportInFlightRef = useRef(false);
	const importInFlightRef = useRef(false);

	const summary = useMemo(() => {
		const created = results.filter((r) => r.status === 'created').length;
		const updated = results.filter((r) => r.status === 'updated').length;
		const errors = results.filter((r) => r.status === 'error').length;
		return { created, updated, errors };
	}, [results]);

	const formatStatus = (status: CsvResult['status']) =>
		translateMessage(`product-csv-status-${status}`, { defaultValue: status });

	const isCsvFile = (file: File) => {
		const filename = file.name.toLowerCase();
		return filename.endsWith('.csv') || file.type.toLowerCase().includes('csv');
	};

	const isSpreadsheetFile = (file: File) => {
		const filename = file.name.toLowerCase();
		const type = file.type.toLowerCase();
		return (
			filename.endsWith('.xlsx') ||
			filename.endsWith('.xls') ||
			type.includes('spreadsheetml') ||
			type.includes('ms-excel')
		);
	};

	const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
		const bytes = new Uint8Array(buffer);
		const chunkSize = 0x8000;
		let binary = '';
		for (let i = 0; i < bytes.length; i += chunkSize) {
			const chunk = bytes.subarray(i, i + chunkSize);
			binary += String.fromCharCode(...chunk);
		}
		return btoa(binary);
	};

	const clearImportFileState = () => {
		setCsvText('');
		setSpreadsheetBase64('');
		setUploadFilename('');
	};

	const handleFile = async (file: File | null) => {
		if (!file) return;
		try {
			if (file.size > PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES) {
				clearImportFileState();
				addNotice({ message: 'product-csv-file-too-large', type: 'error' });
				return;
			}
			setUploadFilename(file.name);
			if (isCsvFile(file)) {
				const content = await file.text();
				const rows = parseCsvRows(content);
				const dataRowsCount = Math.max(0, rows.length - 1);
				if (dataRowsCount > PRODUCT_CSV_IMPORT_MAX_ROW_COUNT) {
					clearImportFileState();
					addNotice({ message: 'product-csv-too-many-rows', type: 'error' });
					return;
				}
				setCsvText(content);
				setSpreadsheetBase64('');
				return;
			}
			if (isSpreadsheetFile(file)) {
				const content = await file.arrayBuffer();
				const rowsCount = countSpreadsheetRows(content);
				const dataRowsCount = Math.max(0, rowsCount - 1);
				if (dataRowsCount > PRODUCT_CSV_IMPORT_MAX_ROW_COUNT) {
					clearImportFileState();
					addNotice({ message: 'product-csv-too-many-rows', type: 'error' });
					return;
				}
				setSpreadsheetBase64(arrayBufferToBase64(content));
				setCsvText('');
				return;
			}
			clearImportFileState();
			addNotice({ message: 'product-csv-invalid-file', type: 'error' });
		} catch {
			clearImportFileState();
			addNotice({ message: 'product-csv-file-read-failed', type: 'error' });
		}
	};

	const handleExport = async () => {
		if (isBusy || exportInFlightRef.current) return;
		exportInFlightRef.current = true;
		setIsExporting(true);
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
			setIsExporting(false);
			exportInFlightRef.current = false;
		}
	};

	const handleImport = async () => {
		if (isBusy || importInFlightRef.current) return;
		if (!csvText.trim() && !spreadsheetBase64.trim()) {
			addNotice({ message: 'product-csv-empty', type: 'error' });
			return;
		}
		importInFlightRef.current = true;
		setIsImporting(true);
		try {
			const formData = new FormData();
			if (csvText.trim()) formData.append('csv', csvText);
			if (spreadsheetBase64.trim()) formData.append('spreadsheetBase64', spreadsheetBase64);
			if (uploadFilename.trim()) formData.append('filename', uploadFilename);
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
			setIsImporting(false);
			importInFlightRef.current = false;
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
					accept='.csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
					disabled={isReadOnly || isImporting}
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						void handleFile(event.target.files?.[0] ?? null);
					}}
				/>
				<Text color='grey60'>
					{translateMessage('product-csv-import-limits', {
						sizeMb: PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_MB,
						rows: String(PRODUCT_CSV_IMPORT_MAX_ROW_COUNT),
					})}
				</Text>
				<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<input
						type='checkbox'
						checked={dryRun}
						disabled={isReadOnly || isImporting}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setDryRun(event.target.checked)}
					/>
					<Text>{translateMessage('product-csv-dry-run')}</Text>
				</Box>
				<Box>
					<Label>{translateMessage('product-csv-reason-label')}</Label>
					<Input
						value={reason}
						disabled={isReadOnly || isImporting}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
						placeholder={translateMessage('product-csv-reason-placeholder')}
					/>
				</Box>
				<Box style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
					<Button variant='outlined' onClick={handleExport} disabled={isBusy}>
						{isExporting
							? translateMessage('product-csv-exporting')
							: translateMessage('product-csv-export')}
					</Button>
					<Button
						variant='contained'
						color='primary'
						style={{ ...actionButtonStyle, display: 'inline-flex', alignItems: 'center', gap: 8 }}
						onClick={handleImport}
						disabled={isReadOnly || isBusy}
					>
						{isImporting ? <Icon icon='Loader' spin /> : null}
						{isImporting
							? translateMessage('product-csv-importing')
							: translateMessage('product-csv-import')}
					</Button>
				</Box>
				{isImporting ? (
					<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<Icon icon='Loader' spin />
						<Text color='grey60'>{translateMessage('product-csv-importing')}</Text>
					</Box>
				) : null}
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
