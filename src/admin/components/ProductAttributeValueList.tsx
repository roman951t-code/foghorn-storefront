import { type ActionProps, OriginalList, useTranslation } from 'adminjs';
import { Box, Button, Input, Label } from '@adminjs/design-system';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const PRODUCT_NAME_FILTER_KEY = 'productNameSearch';

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

const getCurrentFilterParams = () => {
	if (typeof window === 'undefined') return {} as Record<string, string>;
	const params = new URLSearchParams(window.location.search);
	const filters: Record<string, string> = {};
	for (const [key, value] of params.entries()) {
		if (!key.startsWith('filters.')) continue;
		const filterKey = key.slice('filters.'.length);
		if (!filterKey) continue;
		filters[filterKey] = value;
	}
	return filters;
};

const getCurrentProductNameFilter = () => {
	const filters = getCurrentFilterParams();
	return filters[PRODUCT_NAME_FILTER_KEY] ?? '';
};

export default function ProductAttributeValueList(props: ActionProps) {
	const { resource } = props;
	const { translateMessage } = useTranslation();
	const [productNameSearch, setProductNameSearch] = useState('');

	useEffect(() => {
		setProductNameSearch(getCurrentProductNameFilter());
	}, []);

	const applyProductNameSearch = () => {
		const nextFilters = {
			...getCurrentFilterParams(),
		};
		const normalizedSearch = productNameSearch.trim();
		if (normalizedSearch) {
			nextFilters[PRODUCT_NAME_FILTER_KEY] = normalizedSearch;
		} else {
			delete nextFilters[PRODUCT_NAME_FILTER_KEY];
		}
		window.location.href = buildListHref(resource.id, nextFilters);
	};

	const clearProductNameSearch = () => {
		const nextFilters = {
			...getCurrentFilterParams(),
		};
		delete nextFilters[PRODUCT_NAME_FILTER_KEY];
		setProductNameSearch('');
		window.location.href = buildListHref(resource.id, nextFilters);
	};

	const handleProductNameSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		applyProductNameSearch();
	};

	return (
		<Box>
			<Box
				as='form'
				onSubmit={handleProductNameSearchSubmit}
				variant='white'
				p='lg'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{
					border: '1px solid #E2E8F0',
					display: 'grid',
					gap: 10,
				}}
			>
				<Label>{translateMessage('product-search-label')}</Label>
				<Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
					<Input
						value={productNameSearch}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							setProductNameSearch(event.target.value)
						}
						placeholder={translateMessage('product-search-placeholder')}
						style={{ minWidth: 320, flex: 1 }}
					/>
					<Button variant='contained' color='primary' style={actionButtonStyle} type='submit'>
						{translateMessage('product-search-apply')}
					</Button>
					<Button variant='outlined' type='button' onClick={clearProductNameSearch}>
						{translateMessage('product-search-clear')}
					</Button>
				</Box>
			</Box>

			<OriginalList {...props} />
		</Box>
	);
}
