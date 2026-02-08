import type { ActionProps } from 'adminjs';
import { useTranslation } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

const hintKeyByProperty: Record<string, string> = {
	name: 'product-hint-name',
	metaTitle: 'product-hint-metaTitle',
	metaDescription: 'product-hint-metaDescription',
	canonicalUrl: 'product-hint-canonicalUrl',
	openGraphImage: 'product-hint-openGraphImage',
	slug: 'product-hint-slug',
	fullSlug: 'product-hint-fullSlug',
	categoryName: 'product-hint-categoryName',
	subcategoryName: 'product-hint-subcategoryName',
	productCode: 'product-hint-productCode',
	basePrice: 'product-hint-basePrice',
	discountPrice: 'product-hint-discountPrice',
	discountStartAt: 'product-hint-discountStartAt',
	discountEndAt: 'product-hint-discountEndAt',
	currency: 'product-hint-currency',
	stock: 'product-hint-stock',
	inStock: 'product-hint-inStock',
	brand: 'product-hint-brand',
	category: 'product-hint-category',
	tags: 'product-hint-tags',
};

const looksLikeTranslationKey = (value: unknown): value is string =>
	typeof value === 'string' && (value.startsWith('product-') || value.startsWith('bulk-'));

export default function ProductValidationErrorSummary(props: ActionProps) {
	const { record, resource } = props;
	const { translateMessage, translateProperty } = useTranslation();

	const errors = (record?.errors ?? {}) as Record<string, { message?: unknown; type?: unknown }>;
	const items = Object.entries(errors).filter(([, err]) => err && typeof err === 'object' && err.message != null);
	if (items.length === 0) return null;

	return (
		<Box
			variant='white'
			p='xl'
			borderRadius='xl'
			boxShadow='sm'
			mb='xl'
			style={{ border: '1px solid #FCA5A5', background: '#FEF2F2' }}
		>
			<Text fontWeight='bold' mb='sm'>
				{translateMessage('product-validation-summary-title', resource.id, { count: items.length })}
			</Text>
			<Text color='grey60' mb='lg'>
				{translateMessage('product-validation-summary-subtitle')}
			</Text>

			<Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				{items.map(([propertyPath, err]) => {
					const message = err.message;
					const messageText = looksLikeTranslationKey(message)
						? translateMessage(message)
						: String(message ?? '');
					const hintKey = hintKeyByProperty[propertyPath];

					return (
						<Box key={propertyPath} style={{ padding: 12, borderRadius: 12, border: '1px solid #FECACA' }}>
							<Text fontWeight='bold'>{translateProperty(propertyPath, resource.id)}</Text>
							<Text>{messageText}</Text>
							{hintKey ? (
								<Text color='grey60' style={{ fontSize: 13, marginTop: 6 }}>
									{translateMessage(hintKey)}
								</Text>
							) : null}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
