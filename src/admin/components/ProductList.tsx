import { type ActionProps, OriginalList, useTranslation } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';

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
				</Box>
			</Box>

			<OriginalList {...props} />
		</Box>
	);
}

