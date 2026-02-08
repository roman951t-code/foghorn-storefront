import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { flat, type EditPropertyProps, useTranslation } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text } from '@adminjs/design-system';

const PRIMARY_GALLERY_URL_PATH = 'primaryGalleryUrl';

const parseUrls = (value: unknown): string[] => {
	if (value == null) return [];

	const rawValues = Array.isArray(value)
		? value.map((item) => String(item))
		: typeof value === 'string'
			? value.split(/\r?\n/g)
			: [];

	const normalized = rawValues.map((item) => item.trim()).filter(Boolean);
	return Array.from(new Set(normalized));
};

const joinUrls = (urls: string[]) => urls.join('\n');

const parsePrimaryUrl = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized || null;
};

export default function ProductGalleryEdit(props: EditPropertyProps) {
	const { property, record, onChange } = props;
	const { translateMessage, translateProperty } = useTranslation();
	const isExistingProduct = Boolean(record?.id);

	const value = useMemo(
		() => flat.get(record.params, property.path),
		[record.params, property.path]
	);
	const primaryValue = useMemo(
		() => flat.get(record.params, PRIMARY_GALLERY_URL_PATH),
		[record.params]
	);
	const parsedValue = useMemo(() => parseUrls(value), [value]);
	const parsedPrimaryValue = useMemo(() => parsePrimaryUrl(primaryValue), [primaryValue]);
	const [urls, setUrls] = useState(parsedValue);
	const [primaryUrl, setPrimaryUrl] = useState<string | null>(parsedPrimaryValue);
	const [nextUrl, setNextUrl] = useState('');

	useEffect(() => {
		setUrls(parsedValue);
	}, [parsedValue]);

	useEffect(() => {
		setPrimaryUrl(parsedPrimaryValue);
	}, [parsedPrimaryValue]);

	const normalizePrimary = (nextUrls: string[], candidate: string | null): string | null => {
		if (!candidate) return null;
		return nextUrls.includes(candidate) ? candidate : null;
	};

	const commitState = (nextUrls: string[], requestedPrimary: string | null = primaryUrl) => {
		const nextPrimary = normalizePrimary(nextUrls, requestedPrimary);
		setUrls(nextUrls);
		setPrimaryUrl(nextPrimary);
		onChange(property.path, joinUrls(nextUrls));
		onChange(PRIMARY_GALLERY_URL_PATH, nextPrimary ?? '');
	};

	const handleAdd = () => {
		const normalized = nextUrl.trim();
		if (!normalized) return;
		if (urls.includes(normalized)) {
			setNextUrl('');
			return;
		}
		commitState([...urls, normalized], primaryUrl);
		setNextUrl('');
	};

	const handleRemove = (index: number) => {
		commitState(
			urls.filter((_, currentIndex) => currentIndex !== index),
			primaryUrl
		);
	};

	const handlePrimaryToggle = (url: string) => {
		const nextPrimary = primaryUrl === url ? null : url;
		commitState(urls, nextPrimary);
	};

	if (!isExistingProduct) return null;

	return (
		<FormGroup mb='xl'>
			<Label>{translateProperty(property.label, property.resourceId)}</Label>
			<Text color='grey60' mb='lg'>
				{translateMessage('product-hint-galleryUrls')}
			</Text>

			<Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				{urls.length === 0 ? (
					<Box style={{ border: '1px dashed #CBD5E1', borderRadius: 10, padding: 12 }}>
						<Text color='grey60'>{translateMessage('product-gallery-empty')}</Text>
					</Box>
				) : (
					urls.map((url, index) => (
						<Box
							key={`${url}-${index}`}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								border: '1px solid #E2E8F0',
								borderRadius: 10,
								padding: 10,
							}}
						>
							<Box
								style={{
									width: 52,
									height: 52,
									borderRadius: 8,
									overflow: 'hidden',
									border: '1px solid #CBD5E1',
									background: '#F8FAFC',
									flexShrink: 0,
								}}
							>
								<img
									src={url}
									alt={translateMessage('product-gallery-thumb-alt', { index: index + 1 })}
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							</Box>
							<Text style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{url}
							</Text>
							<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<input
									type='checkbox'
									checked={primaryUrl === url}
									disabled={Boolean(primaryUrl) && primaryUrl !== url}
									onChange={() => handlePrimaryToggle(url)}
								/>
								<Text>{translateMessage('product-gallery-primary')}</Text>
							</label>
							<Button size='sm' onClick={() => handleRemove(index)}>
								{translateMessage('product-gallery-remove')}
							</Button>
						</Box>
					))
				)}
			</Box>

			<Box mt='lg' style={{ display: 'flex', gap: 8 }}>
				<Input
					value={nextUrl}
					placeholder={translateMessage('product-gallery-url-placeholder')}
					onChange={(event: ChangeEvent<HTMLInputElement>) => setNextUrl(event.target.value)}
					onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
						if (event.key !== 'Enter') return;
						event.preventDefault();
						handleAdd();
					}}
				/>
				<Button
					variant='contained'
					color='primary'
					size='sm'
					onClick={handleAdd}
					disabled={nextUrl.trim().length === 0}
				>
					{translateMessage('product-gallery-add')}
				</Button>
			</Box>
		</FormGroup>
	);
}
