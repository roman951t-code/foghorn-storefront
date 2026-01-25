import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import {
	Box,
	Button,
	FormGroup,
	Input,
	Label,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Text,
} from '@adminjs/design-system';

type Attribute = { id: string; name: string; unit?: string | null };
type AttributeValue = { attributeId: string; value: string };
type VariantPayload = {
	id: string;
	sku: string;
	price: number;
	stock: number;
	options: AttributeValue[];
};
type ProductPayload = {
	basePrice: number;
	currency: string;
	productCode: string | null;
};
type VariantMatrixPayload = {
	product: ProductPayload | null;
	attributes: Attribute[];
	attributeValues: AttributeValue[];
	variants: VariantPayload[];
};

type AttributeState = Attribute & {
	enabled: boolean;
	valueText: string;
};

type VariantRow = {
	signature: string;
	options: AttributeValue[];
	sku: string;
	price: string;
	stock: string;
};

const api = new ApiClient();

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const parseValues = (valueText: string) =>
	Array.from(
		new Set(
			valueText
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean)
		)
	);

const buildSignature = (options: AttributeValue[]) =>
	options
		.slice()
		.sort((a, b) => a.attributeId.localeCompare(b.attributeId))
		.map((option) => `${option.attributeId}:${option.value}`)
		.join('|');

const sanitizeSkuPart = (value: string) =>
	value
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^A-Za-z0-9_-]/g, '')
		.toUpperCase();

const buildSku = (baseSku: string, options: AttributeValue[]) => {
	const base = sanitizeSkuPart(baseSku || 'SKU') || 'SKU';
	const suffix = options
		.map((option) => sanitizeSkuPart(option.value))
		.filter(Boolean)
		.join('-');
	return suffix ? `${base}-${suffix}` : base;
};

const buildCombinations = (attributes: AttributeState[]) => {
	const selected = attributes.filter((attr) => attr.enabled);
	if (selected.length === 0) return [];
	let combos: AttributeValue[][] = [[]];
	for (const attr of selected) {
		const values = parseValues(attr.valueText);
		if (values.length === 0) return [];
		combos = combos.flatMap((combo) =>
			values.map((value) => [...combo, { attributeId: attr.id, value }])
		);
	}
	return combos;
};

export default function ProductVariantMatrix(props: ActionProps) {
	const { action, record, resource } = props;
	const { translateAction, translateMessage } = useTranslation();
	const addNotice = useNotice();
	const addNoticeRef = useRef(addNotice);
	const recordId =
		record?.id ?? (record?.params?.id != null ? String(record.params.id) : undefined);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [attributes, setAttributes] = useState<AttributeState[]>([]);
	const [variants, setVariants] = useState<VariantRow[]>([]);
	const [product, setProduct] = useState<ProductPayload | null>(null);

	useEffect(() => {
		addNoticeRef.current = addNotice;
	}, [addNotice]);

	useEffect(() => {
		if (!recordId) {
			setLoadError('product-variant-missing-record');
			setLoading(false);
			return;
		}
		let isActive = true;
		setLoading(true);
		setLoadError(null);
		api.recordAction({
			resourceId: resource.id,
			recordId,
			actionName: action.name,
			method: 'get',
		})
			.then((response) => {
				if (!isActive) return;
				const payload = (response.data.payload ?? null) as VariantMatrixPayload | null;
				if (!payload) return;
				const valuesByAttribute = payload.attributeValues.reduce((acc, entry) => {
					if (!acc.has(entry.attributeId)) acc.set(entry.attributeId, []);
					acc.get(entry.attributeId)!.push(entry.value);
					return acc;
				}, new Map<string, string[]>());

				const nextAttributes = payload.attributes.map((attr) => {
					const values = valuesByAttribute.get(attr.id) ?? [];
					return {
						...attr,
						enabled: values.length > 0,
						valueText: values.join(', '),
					};
				});

				const order = new Map(nextAttributes.map((attr, idx) => [attr.id, idx]));
				const sortOptions = (options: AttributeValue[]) =>
					options
						.slice()
						.sort((a, b) => (order.get(a.attributeId) ?? 0) - (order.get(b.attributeId) ?? 0));

				const nextVariants = payload.variants.map((variant) => ({
					signature: buildSignature(variant.options),
					options: sortOptions(variant.options),
					sku: variant.sku,
					price: String(variant.price ?? ''),
					stock: String(variant.stock ?? ''),
				}));

				setProduct(payload.product);
				setAttributes(nextAttributes);
				setVariants(nextVariants);
			})
			.catch(() => {
				if (!isActive) return;
				setLoadError('product-variant-load-failed');
				addNoticeRef.current({ message: 'product-variant-load-failed', type: 'error' });
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [action.name, recordId, resource.id]);

	const attributeOrder = useMemo(
		() => new Map(attributes.map((attr, idx) => [attr.id, idx])),
		[attributes]
	);

	const orderedAttributes = useMemo(
		() => attributes.slice().sort((a, b) => (attributeOrder.get(a.id) ?? 0) - (attributeOrder.get(b.id) ?? 0)),
		[attributeOrder, attributes]
	);

	const variantsBySignature = useMemo(() => {
		const map = new Map<string, VariantRow>();
		variants.forEach((variant) => map.set(variant.signature, variant));
		return map;
	}, [variants]);

	const handleToggleAttribute = (attributeId: string) => {
		setAttributes((prev) =>
			prev.map((attr) =>
				attr.id === attributeId ? { ...attr, enabled: !attr.enabled } : attr
			)
		);
	};

	const handleAttributeValuesChange = (attributeId: string, valueText: string) => {
		setAttributes((prev) =>
			prev.map((attr) => (attr.id === attributeId ? { ...attr, valueText } : attr))
		);
	};

	const handleGenerate = () => {
		const combos = buildCombinations(attributes);
		if (combos.length === 0) {
			addNoticeRef.current({ message: 'product-variant-no-attributes', type: 'error' });
			return;
		}
		const baseSku = product?.productCode ?? '';
		const basePrice = product?.basePrice != null ? String(product.basePrice) : '';
		const nextVariants = combos.map((options) => {
			const signature = buildSignature(options);
			const existing = variantsBySignature.get(signature);
			return {
				signature,
				options: options
					.slice()
					.sort(
						(a, b) => (attributeOrder.get(a.attributeId) ?? 0) - (attributeOrder.get(b.attributeId) ?? 0)
					),
				sku: existing?.sku ?? buildSku(baseSku, options),
				price: existing?.price ?? basePrice,
				stock: existing?.stock ?? '0',
			};
		});
		setVariants(nextVariants);
	};

	const handleVariantChange = (index: number, field: 'sku' | 'price' | 'stock', value: string) => {
		setVariants((prev) =>
			prev.map((variant, idx) => (idx === index ? { ...variant, [field]: value } : variant))
		);
	};

	const handleSave = async () => {
		if (!recordId || saving) return;
		setSaving(true);
		try {
			const payloadAttributes = attributes
				.filter((attr) => attr.enabled)
				.map((attr) => ({
					id: attr.id,
					values: parseValues(attr.valueText),
				}));

			const payloadVariants = variants.map((variant) => ({
				sku: variant.sku,
				price: variant.price,
				stock: variant.stock,
				options: variant.options,
			}));

			const formData = new FormData();
			formData.append('attributes', JSON.stringify(payloadAttributes));
			formData.append('variants', JSON.stringify(payloadVariants));

			const response = await api.recordAction({
				resourceId: resource.id,
				recordId,
				actionName: action.name,
				method: 'post',
				data: formData,
			});

			if (response.data.notice) addNoticeRef.current(response.data.notice);
		} catch {
			addNoticeRef.current({ message: 'product-variant-save-failed', type: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const title = translateAction(action.name, resource.id);
	const hasVariants = variants.length > 0;

	return (
		<Box
			variant='white'
			p='xxl'
			borderRadius='xl'
			boxShadow='sm'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb='xl'>
				<Text fontSize='xl' fontWeight='bold'>
					{title}
				</Text>
			</Box>

			{loading ? (
				<Text color='grey60'>{translateMessage('product-variant-loading')}</Text>
			) : loadError ? (
				<Text color='grey60'>{translateMessage(loadError)}</Text>
			) : (
				<>
					<Text mb='lg' color='grey60'>
						{translateMessage('product-variant-description')}
					</Text>

					<Box
						variant='white'
						p='xl'
						borderRadius='lg'
						mb='xl'
						style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}
					>
						<Text fontWeight='bold' mb='md'>
							{translateMessage('product-variant-attributes-title')}
						</Text>
						<Box style={{ display: 'grid', gap: 16 }}>
							{orderedAttributes.map((attr) => (
								<Box
									key={attr.id}
									style={{
										display: 'grid',
										gridTemplateColumns: 'minmax(180px, 220px) 1fr',
										gap: 16,
										alignItems: 'center',
									}}
								>
									<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
										<input
											type='checkbox'
											checked={attr.enabled}
											onChange={() => handleToggleAttribute(attr.id)}
										/>
										<span>
											{attr.name}
											{attr.unit ? ` (${attr.unit})` : ''}
										</span>
									</label>
									<FormGroup>
										<Label>{translateMessage('product-variant-values-label')}</Label>
										<Input
											placeholder={translateMessage('product-variant-values-placeholder')}
											value={attr.valueText}
											disabled={!attr.enabled}
											onChange={(event) => handleAttributeValuesChange(attr.id, event.target.value)}
										/>
									</FormGroup>
								</Box>
							))}
						</Box>
						<Box mt='lg' style={{ display: 'flex', gap: 20 }}>
							<Button variant='outlined' onClick={handleGenerate}>
								{translateMessage('product-variant-generate')}
							</Button>
							<Button
								variant='contained'
								color='primary'
								onClick={handleSave}
								disabled={saving}
								style={actionButtonStyle}
							>
								{saving ? translateMessage('product-variant-saving') : translateMessage('product-variant-save')}
							</Button>
						</Box>
					</Box>

					<Box>
						<Text fontWeight='bold' mb='md'>
							{translateMessage('product-variant-matrix-title')}
						</Text>
						{hasVariants ? (
							<Table>
								<TableHead>
									<TableRow>
										{orderedAttributes
											.filter((attr) => attr.enabled)
											.map((attr) => (
												<TableCell key={attr.id}>{attr.name}</TableCell>
											))}
										<TableCell>{translateMessage('product-variant-sku-label')}</TableCell>
										<TableCell>{translateMessage('product-variant-price-label')}</TableCell>
										<TableCell>{translateMessage('product-variant-stock-label')}</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{variants.map((variant, index) => (
										<TableRow key={variant.signature}>
											{orderedAttributes
												.filter((attr) => attr.enabled)
												.map((attr) => {
													const value =
														variant.options.find((opt) => opt.attributeId === attr.id)?.value ??
														'-';
													return <TableCell key={attr.id}>{value}</TableCell>;
												})}
											<TableCell>
												<Input
													value={variant.sku}
													onChange={(event) => handleVariantChange(index, 'sku', event.target.value)}
												/>
											</TableCell>
											<TableCell>
												<Input
													type='number'
													value={variant.price}
													onChange={(event) => handleVariantChange(index, 'price', event.target.value)}
												/>
											</TableCell>
											<TableCell>
												<Input
													type='number'
													value={variant.stock}
													onChange={(event) => handleVariantChange(index, 'stock', event.target.value)}
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<Text color='grey60'>{translateMessage('product-variant-no-variants')}</Text>
						)}
					</Box>
				</>
			)}
		</Box>
	);
}
