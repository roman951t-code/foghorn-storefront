import { ComponentLoader } from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';

const adminDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentLoader = new ComponentLoader();
const orderStatusActionComponent = componentLoader.add(
	'OrderStatusAction',
	path.join(adminDir, 'components', 'OrderStatusAction')
);
const cancelOrderActionComponent = componentLoader.add(
	'CancelOrderAction',
	path.join(adminDir, 'components', 'CancelOrderAction')
);
const orderAuditTimelineActionComponent = componentLoader.add(
	'OrderAuditTimelineAction',
	path.join(adminDir, 'components', 'OrderAuditTimelineAction')
);
const orderShowComponent = componentLoader.add(
	'OrderShow',
	path.join(adminDir, 'components', 'OrderShow')
);
const orderFulfillmentActionComponent = componentLoader.add(
	'OrderFulfillmentAction',
	path.join(adminDir, 'components', 'OrderFulfillmentAction')
);
const orderPackingSlipActionComponent = componentLoader.add(
	'OrderPackingSlipAction',
	path.join(adminDir, 'components', 'OrderPackingSlipAction')
);
const orderTotalListComponent = componentLoader.add(
	'OrderTotalList',
	path.join(adminDir, 'components', 'OrderTotalList')
);
const orderTotalRangeFilterComponent = componentLoader.add(
	'OrderTotalRangeFilter',
	path.join(adminDir, 'components', 'OrderTotalRangeFilter')
);
const selectFilterWithPlaceholderComponent = componentLoader.add(
	'SelectFilterWithPlaceholder',
	path.join(adminDir, 'components', 'SelectFilterWithPlaceholder')
);
const userShowComponent = componentLoader.add('UserShow', path.join(adminDir, 'components', 'UserShow'));
const userSegmentsComponent = componentLoader.add(
	'UserSegments',
	path.join(adminDir, 'components', 'UserSegments')
);
const productScheduleDiscountActionComponent = componentLoader.add(
	'ProductScheduleDiscountAction',
	path.join(adminDir, 'components', 'ProductScheduleDiscountAction')
);
const productNameListComponent = componentLoader.add(
	'ProductNameList',
	path.join(adminDir, 'components', 'ProductNameList')
);
const productListComponent = componentLoader.add('ProductList', path.join(adminDir, 'components', 'ProductList'));
const productShowComponent = componentLoader.add('ProductShow', path.join(adminDir, 'components', 'ProductShow'));
const productBulkSetCategoryActionComponent = componentLoader.add(
	'ProductBulkSetCategoryAction',
	path.join(adminDir, 'components', 'ProductBulkSetCategoryAction')
);
const productBulkSetBrandActionComponent = componentLoader.add(
	'ProductBulkSetBrandAction',
	path.join(adminDir, 'components', 'ProductBulkSetBrandAction')
);
const productBulkEditTagsActionComponent = componentLoader.add(
	'ProductBulkEditTagsAction',
	path.join(adminDir, 'components', 'ProductBulkEditTagsAction')
);
const productBulkAdjustPriceActionComponent = componentLoader.add(
	'ProductBulkAdjustPriceAction',
	path.join(adminDir, 'components', 'ProductBulkAdjustPriceAction')
);
const productBulkToggleInStockActionComponent = componentLoader.add(
	'ProductBulkToggleInStockAction',
	path.join(adminDir, 'components', 'ProductBulkToggleInStockAction')
);
const dashboardComponent = componentLoader.add(
	'Dashboard',
	path.join(adminDir, 'components', 'Dashboard')
);
componentLoader.override('Login', path.join(adminDir, 'components', 'Login'));
componentLoader.override('LoggedIn', path.join(adminDir, 'components', 'LoggedIn'));
componentLoader.override('TopBar', path.join(adminDir, 'components', 'TopBar'));
componentLoader.override('FilterDrawer', path.join(adminDir, 'components', 'FilterDrawer'));

export {
	componentLoader,
	orderStatusActionComponent,
	cancelOrderActionComponent,
	orderAuditTimelineActionComponent,
	orderShowComponent,
	orderFulfillmentActionComponent,
	orderPackingSlipActionComponent,
	orderTotalListComponent,
	orderTotalRangeFilterComponent,
	selectFilterWithPlaceholderComponent,
	userShowComponent,
	userSegmentsComponent,
	productScheduleDiscountActionComponent,
	productNameListComponent,
	productListComponent,
	productShowComponent,
	productBulkSetCategoryActionComponent,
	productBulkSetBrandActionComponent,
	productBulkEditTagsActionComponent,
	productBulkAdjustPriceActionComponent,
	productBulkToggleInStockActionComponent,
	dashboardComponent,
};
