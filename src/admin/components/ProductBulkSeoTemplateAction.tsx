import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Label, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

type SeoPreviewRow = {
	id: string;
	name: string;
	changedFields: string[];
	before: {
		metaTitle: string | null;
		metaDescription: string | null;
		canonicalUrl: string | null;
		openGraphImage: string | null;
	};
	after: {
		metaTitle: string | null;
		metaDescription: string | null;
		canonicalUrl: string | null;
		openGraphImage: string | null;
	};
};

type SeoSummary = {
	selected: number;
	changed: number;
	updated: number;
};

type SeoActionPayload = {
	placeholders?: string[];
	defaults?: {
		metaTitleTemplate?: string;
		metaDescriptionTemplate?: string;
		canonicalTemplate?: string;
		openGraphImageTemplate?: string;
	};
	results?: SeoPreviewRow[];
	summary?: SeoSummary;
};

const api = new ApiClient();
const BULK_SEO_ACTION_NAME = 'bulkSeoTemplate';

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const resolveRecordIds = (records: ActionProps['records']) => {
	const fromProps = (records ?? []).map((record) => record.id).filter(Boolean) as string[];
	if (fromProps.length) return fromProps;
	if (typeof window === 'undefined') return [];
	const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	return raw
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
};

const normalizeRows = (value: unknown): SeoPreviewRow[] => (Array.isArray(value) ? (value as SeoPreviewRow[]) : []);

const normalizeSummary = (value: unknown): SeoSummary | null => {
	if (!value || typeof value !== 'object') return null;
	const source = value as Record<string, unknown>;
	const selected = Number(source.selected);
	const changed = Number(source.changed);
	const updated = Number(source.updated);
	if (!Number.isFinite(selected) || !Number.isFinite(changed) || !Number.isFinite(updated)) return null;
	return { selected, changed, updated };
};

const renderCellValues = (values: {
	metaTitle: string | null;
	metaDescription: string | null;
	canonicalUrl: string | null;
	openGraphImage: string | null;
}) => (
	<Box style={{ display: 'grid', gap: 6 }}>
		<Text fontSize='15px'>
			<strong>metaTitle:</strong> {values.metaTitle || '-'}
		</Text>
		<Text fontSize='15px'>
			<strong>metaDescription:</strong> {values.metaDescription || '-'}
		</Text>
		<Text fontSize='15px'>
			<strong>canonicalUrl:</strong> {values.canonicalUrl || '-'}
		</Text>
		<Text fontSize='15px'>
			<strong>openGraphImage:</strong> {values.openGraphImage || '-'}
		</Text>
	</Box>
);

export default function ProductBulkSeoTemplateAction({ action, resource, records }: ActionProps) {
	const addNotice = useNotice();
	const { translateAction, translateMessage } = useTranslation();
	const isReadOnly = useIsReadOnlyAdmin();

	const recordIds = useMemo(() => resolveRecordIds(records), [records]);
	const recordIdsKey = useMemo(() => recordIds.join(','), [recordIds]);
	const [metaTitleTemplate, setMetaTitleTemplate] = useState('');
	const [metaDescriptionTemplate, setMetaDescriptionTemplate] = useState('');
	const [canonicalTemplate, setCanonicalTemplate] = useState('');
	const [openGraphImageTemplate, setOpenGraphImageTemplate] = useState('');
	const [overwriteExisting, setOverwriteExisting] = useState(false);
	const [placeholders, setPlaceholders] = useState<string[]>([]);
	const [results, setResults] = useState<SeoPreviewRow[]>([]);
	const [summary, setSummary] = useState<SeoSummary | null>(null);
	const [loadingDefaults, setLoadingDefaults] = useState(false);
	const [runningMode, setRunningMode] = useState<'preview' | 'apply' | null>(null);

	const hasAnyTemplate = Boolean(
		metaTitleTemplate.trim() ||
			metaDescriptionTemplate.trim() ||
			canonicalTemplate.trim() ||
			openGraphImageTemplate.trim()
	);
	const canRun = recordIds.length > 0 && hasAnyTemplate;
	const isFormDisabled = runningMode !== null || isReadOnly;
	const disabledMessage = isReadOnly
		? translateMessage('product-seo-template-disabled-readonly')
		: runningMode !== null
			? translateMessage('product-seo-template-disabled-running')
			: null;

	useEffect(() => {
		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const loadDefaults = async () => {
			const ids = recordIdsKey
				.split(',')
				.map((id) => id.trim())
				.filter(Boolean);
			if (!ids.length) return;

			setLoadingDefaults(true);
			try {
				const timeoutPromise = new Promise<never>((_resolve, reject) => {
					timeoutId = setTimeout(() => reject(new Error('timeout')), 10000);
				});

				const response = (await Promise.race([
					api.bulkAction({
						resourceId: resource.id,
						recordIds: ids,
						actionName: BULK_SEO_ACTION_NAME,
						method: 'get',
					}),
					timeoutPromise,
				])) as Awaited<ReturnType<typeof api.bulkAction>>;

				const payload = (response.data.payload ?? {}) as SeoActionPayload;
				if (cancelled) return;
				const nextPlaceholders = Array.isArray(payload.placeholders)
					? payload.placeholders.filter((entry): entry is string => typeof entry === 'string')
					: [];
				setPlaceholders(nextPlaceholders);

				const defaults = payload.defaults ?? {};
				setMetaTitleTemplate((current) => current || defaults.metaTitleTemplate || '');
				setMetaDescriptionTemplate((current) => current || defaults.metaDescriptionTemplate || '');
				setCanonicalTemplate((current) => current || defaults.canonicalTemplate || '');
				setOpenGraphImageTemplate((current) => current || defaults.openGraphImageTemplate || '');
			} catch {
				if (!cancelled) addNotice({ message: 'product-seo-template-load-failed', type: 'error' });
			} finally {
				if (timeoutId !== null) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
				if (!cancelled) setLoadingDefaults(false);
			}
		};

		loadDefaults();
		return () => {
			cancelled = true;
			if (timeoutId !== null) clearTimeout(timeoutId);
		};
	}, [addNotice, recordIdsKey, resource.id]);

	const formatChangedFields = (fields: string[]) => {
		if (!fields.length) return '-';
		return fields
			.map((field) => translateMessage(`product-seo-template-field-${field}`, { defaultValue: field }))
			.join(', ');
	};

	const runMode = async (mode: 'preview' | 'apply') => {
		if (!canRun || runningMode) return;
		setRunningMode(mode);
		try {
			const formData = new FormData();
			formData.append('mode', mode);
			formData.append('metaTitleTemplate', metaTitleTemplate);
			formData.append('metaDescriptionTemplate', metaDescriptionTemplate);
			formData.append('canonicalTemplate', canonicalTemplate);
			formData.append('openGraphImageTemplate', openGraphImageTemplate);
			formData.append('overwriteExisting', String(overwriteExisting));

				const response = await api.bulkAction({
					resourceId: resource.id,
					recordIds,
					actionName: BULK_SEO_ACTION_NAME,
					method: 'post',
					data: formData,
				});

			if (response.data.notice) addNotice(response.data.notice);

			const payload = (response.data.payload ?? {}) as SeoActionPayload;
			setResults(normalizeRows(payload.results));
			setSummary(normalizeSummary(payload.summary));
		} catch {
			addNotice({ message: 'product-seo-template-failed', type: 'error' });
		} finally {
			setRunningMode(null);
		}
	};

	return (
		<Box variant='white' p='xxl' borderRadius='xl' boxShadow='sm' style={{ border: '1px solid #E2E8F0' }}>
			<Text fontSize='xl' fontWeight='bold' mb='sm'>
				{translateAction(action.name, resource.id)}
			</Text>
			<Text color='grey60' mb='md'>
				{translateMessage('product-seo-template-description')}
			</Text>
			<Text color='grey60' mb='xl'>
				{translateMessage('product-seo-template-selected', { count: recordIds.length })}
			</Text>
			{loadingDefaults ? (
				<Text color='grey60' mb='sm'>
					{translateMessage('product-seo-template-disabled-loading')}
				</Text>
			) : null}
			{disabledMessage ? (
				<Text color='warning' mb='lg'>
					{disabledMessage}
				</Text>
			) : null}

			<Box
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
					columnGap: 20,
					rowGap: 14,
				}}
			>
				<FormGroup style={{ marginBottom: 0 }}>
					<Label>{translateMessage('product-seo-template-meta-title')}</Label>
					<textarea
						value={metaTitleTemplate}
						disabled={isFormDisabled}
						onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMetaTitleTemplate(event.target.value)}
						rows={3}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
							fontFamily: 'inherit',
							resize: 'vertical',
						}}
					/>
				</FormGroup>
				<FormGroup style={{ marginBottom: 0 }}>
					<Label>{translateMessage('product-seo-template-meta-description')}</Label>
					<textarea
						value={metaDescriptionTemplate}
						disabled={isFormDisabled}
						onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMetaDescriptionTemplate(event.target.value)}
						rows={3}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
							fontFamily: 'inherit',
							resize: 'vertical',
						}}
					/>
				</FormGroup>
				<FormGroup style={{ marginBottom: 0 }}>
					<Label>{translateMessage('product-seo-template-canonical')}</Label>
					<textarea
						value={canonicalTemplate}
						disabled={isFormDisabled}
						onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCanonicalTemplate(event.target.value)}
						rows={2}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
							fontFamily: 'inherit',
							resize: 'vertical',
						}}
					/>
				</FormGroup>
				<FormGroup style={{ marginBottom: 0 }}>
					<Label>{translateMessage('product-seo-template-og-image')}</Label>
					<textarea
						value={openGraphImageTemplate}
						disabled={isFormDisabled}
						onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setOpenGraphImageTemplate(event.target.value)}
						rows={2}
						style={{
							width: '100%',
							padding: '10px 12px',
							borderRadius: 8,
							border: '1px solid #E2E8F0',
							fontSize: 15,
							fontFamily: 'inherit',
							resize: 'vertical',
						}}
					/>
				</FormGroup>
			</Box>

			<Box mt='lg' style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
				<input
					id='overwrite-existing'
					type='checkbox'
					checked={overwriteExisting}
					disabled={isFormDisabled}
					onChange={(event: ChangeEvent<HTMLInputElement>) => setOverwriteExisting(event.target.checked)}
				/>
				<Label inline htmlFor='overwrite-existing'>
					{translateMessage('product-seo-template-overwrite')}
				</Label>
			</Box>

			<Box mt='lg'>
				<Text fontWeight='bold' mb='sm'>
					{translateMessage('product-seo-template-placeholders')}
				</Text>
				<Text color='grey60'>
					{placeholders.length > 0 ? placeholders.join(', ') : translateMessage('product-seo-template-no-placeholders')}
				</Text>
			</Box>

				<Box mt='xl' style={{ display: 'flex', gap: 12 }}>
					<Button
						variant='outlined'
						disabled={!canRun || runningMode !== null}
						onClick={() => runMode('preview')}
					>
						{runningMode === 'preview'
							? translateMessage('product-seo-template-previewing')
							: translateMessage('product-seo-template-preview')}
					</Button>
					<Button
						variant='contained'
						color='primary'
						style={actionButtonStyle}
						disabled={isReadOnly || !canRun || runningMode !== null}
						onClick={() => runMode('apply')}
					>
						{runningMode === 'apply'
							? translateMessage('product-seo-template-applying')
							: translateMessage('product-seo-template-apply')}
					</Button>
				</Box>

			{summary ? (
				<Text mt='xl' fontWeight='bold'>
					{translateMessage('product-seo-template-summary', {
						selected: String(summary.selected),
						changed: String(summary.changed),
						updated: String(summary.updated),
					})}
				</Text>
			) : null}

			{results.length > 0 ? (
				<Box mt='lg'>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{translateMessage('product-seo-template-table-product')}</TableCell>
								<TableCell>{translateMessage('product-seo-template-table-fields')}</TableCell>
								<TableCell>{translateMessage('product-seo-template-table-before')}</TableCell>
								<TableCell>{translateMessage('product-seo-template-table-after')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{results.map((row) => (
								<TableRow key={row.id}>
									<TableCell>{row.name}</TableCell>
									<TableCell>{formatChangedFields(row.changedFields)}</TableCell>
									<TableCell>{renderCellValues(row.before)}</TableCell>
									<TableCell>{renderCellValues(row.after)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Box>
			) : null}
		</Box>
	);
}
