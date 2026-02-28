import { Box, Button, Drawer, DrawerContent, DrawerFooter, H3, Icon } from '@adminjs/design-system';
import isNil from 'lodash/isNil.js';
import pickBy from 'lodash/pickBy.js';
import { type FormEventHandler, useEffect, useRef, useState } from 'react';
import { BasePropertyComponent, useFilterDrawer, useQueryParams, useTranslation } from 'adminjs';

type FilterProps = {
	resource: { id: string; filterProperties: Array<{ propertyPath: string }> };
};

export default function FilterDrawer(props: FilterProps) {
	const { resource } = props;
	const properties = resource.filterProperties;

	const [filter, setFilter] = useState<Record<string, unknown>>({});
	const { translateButton, translateLabel } = useTranslation();
	const initialLoad = useRef(true);
	const { isVisible, toggleFilter } = useFilterDrawer();
	const { storeParams, clearParams, filters } = useQueryParams();

	useEffect(() => {
		if (initialLoad.current) {
			initialLoad.current = false;
		} else {
			setFilter({});
		}
	}, [resource.id]);

	const handleSubmit: FormEventHandler<HTMLElement> = (event) => {
		event.preventDefault();
		storeParams({ filters: pickBy(filter, (v) => !isNil(v)), page: '1' });
	};

	const handleReset: FormEventHandler<HTMLElement> = (event) => {
		event.preventDefault();
		clearParams('filters');
		setFilter({});
	};

	useEffect(() => {
		if (filters) {
			setFilter(filters);
		}
	}, [filters]);

	const handleChange = (propertyOrRecord: string | { params?: unknown }, value: any): void => {
		if (typeof propertyOrRecord !== 'string') {
			throw new Error('you can not pass RecordJSON to filters');
		}
		setFilter({
			...filter,
			[propertyOrRecord]: typeof value === 'string' && !value.length ? undefined : value,
		});
	};

	const getResourceElementCss = (resourceId: string, suffix: string) => `${resourceId}-${suffix}`;
	const contentTag = getResourceElementCss(resource.id, 'filter-drawer');
	const cssContent = getResourceElementCss(resource.id, 'filter-drawer-content');
	const cssFooter = getResourceElementCss(resource.id, 'filter-drawer-footer');
	const cssButtonApply = getResourceElementCss(resource.id, 'filter-drawer-button-apply');
	const cssButtonReset = getResourceElementCss(resource.id, 'filter-drawer-button-reset');

	return (
		<>
			{isVisible ? (
				<button
					type='button'
					className='admin-filter-overlay'
					onClick={toggleFilter}
					aria-label='Close filters'
				/>
			) : null}
			<Drawer
				variant='filter'
				isHidden={!isVisible}
				as='form'
				onSubmit={handleSubmit}
				onReset={handleReset}
				data-css={contentTag}
			>
				<DrawerContent data-css={cssContent}>
					<Box flex justifyContent='space-between'>
						<H3>{translateLabel('filters', resource.id)}</H3>
						<Button
							type='button'
							variant='light'
							size='icon'
							rounded
							color='text'
							onClick={toggleFilter}
						>
							<Icon icon='X' />
						</Button>
					</Box>
					<Box my='x3'>
						{properties.map((property) => (
							<BasePropertyComponent
								key={property.propertyPath}
								where='filter'
								onChange={handleChange}
								property={property as any}
								filter={filter}
								resource={resource as any}
							/>
						))}
					</Box>
				</DrawerContent>
				<DrawerFooter data-css={cssFooter}>
					<Button type='button' variant='light' onClick={handleReset} data-css={cssButtonReset}>
						{translateButton('resetFilter', resource.id)}
					</Button>
					<Button type='submit' variant='contained' data-css={cssButtonApply}>
						{translateButton('applyChanges', resource.id)}
					</Button>
				</DrawerFooter>
			</Drawer>
		</>
	);
}
