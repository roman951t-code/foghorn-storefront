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
const orderReturnActionComponent = componentLoader.add(
	'OrderReturnAction',
	path.join(adminDir, 'components', 'OrderReturnAction')
);
const orderBulkPackingSlipActionComponent = componentLoader.add(
	'OrderBulkPackingSlipAction',
	path.join(adminDir, 'components', 'OrderBulkPackingSlipAction')
);
const orderShippingLabelActionComponent = componentLoader.add(
	'OrderShippingLabelAction',
	path.join(adminDir, 'components', 'OrderShippingLabelAction')
);
const orderBulkShippingLabelActionComponent = componentLoader.add(
	'OrderBulkShippingLabelAction',
	path.join(adminDir, 'components', 'OrderBulkShippingLabelAction')
);
const orderCsvExportActionComponent = componentLoader.add(
	'OrderCsvExportAction',
	path.join(adminDir, 'components', 'OrderCsvExportAction')
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
const productSchedulePublishActionComponent = componentLoader.add(
	'ProductSchedulePublishAction',
	path.join(adminDir, 'components', 'ProductSchedulePublishAction')
);
const productNameListComponent = componentLoader.add(
	'ProductNameList',
	path.join(adminDir, 'components', 'ProductNameList')
);
const productListComponent = componentLoader.add('ProductList', path.join(adminDir, 'components', 'ProductList'));
const productAttributeValueListComponent = componentLoader.add(
	'ProductAttributeValueList',
	path.join(adminDir, 'components', 'ProductAttributeValueList')
);
const orderListComponent = componentLoader.add('OrderList', path.join(adminDir, 'components', 'OrderList'));
const productShowComponent = componentLoader.add('ProductShow', path.join(adminDir, 'components', 'ProductShow'));
const productVariantMatrixComponent = componentLoader.add(
	'ProductVariantMatrix',
	path.join(adminDir, 'components', 'ProductVariantMatrix')
);
const productCsvImportExportActionComponent = componentLoader.add(
	'ProductCsvImportExportAction',
	path.join(adminDir, 'components', 'ProductCsvImportExportAction')
);
const productGalleryEditComponent = componentLoader.add(
	'ProductGalleryEdit',
	path.join(adminDir, 'components', 'ProductGalleryEdit')
);
const productTagsEditComponent = componentLoader.add(
	'ProductTagsEdit',
	path.join(adminDir, 'components', 'ProductTagsEdit')
);
const productNewComponent = componentLoader.add('ProductNew', path.join(adminDir, 'components', 'ProductNew'));
const productEditComponent = componentLoader.add('ProductEdit', path.join(adminDir, 'components', 'ProductEdit'));
const productActivityTimelineComponent = componentLoader.add(
	'ProductActivityTimeline',
	path.join(adminDir, 'components', 'ProductActivityTimeline')
);
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
const productBulkAdjustStockActionComponent = componentLoader.add(
	'ProductBulkAdjustStockAction',
	path.join(adminDir, 'components', 'ProductBulkAdjustStockAction')
);
const productBulkToggleInStockActionComponent = componentLoader.add(
	'ProductBulkToggleInStockAction',
	path.join(adminDir, 'components', 'ProductBulkToggleInStockAction')
);
const productBulkSeoTemplateActionComponent = componentLoader.add(
	'ProductBulkSeoTemplateAction',
	path.join(adminDir, 'components', 'ProductBulkSeoTemplateAction')
);
const reviewShowComponent = componentLoader.add('ReviewShow', path.join(adminDir, 'components', 'ReviewShow'));
const localizedTranslationsEditorComponent = componentLoader.add(
	'LocalizedTranslationsEditor',
	path.join(adminDir, 'components', 'LocalizedTranslationsEditor')
);
const dashboardComponent = componentLoader.add(
	'Dashboard',
	path.join(adminDir, 'components', 'Dashboard')
);
componentLoader.override('Login', path.join(adminDir, 'components', 'Login'));
componentLoader.override('LoggedIn', path.join(adminDir, 'components', 'LoggedIn'));
componentLoader.override('TopBar', path.join(adminDir, 'components', 'TopBar'));
componentLoader.override('ActionButton', path.join(adminDir, 'components', 'ActionButton'));
componentLoader.override('FilterDrawer', path.join(adminDir, 'components', 'FilterDrawer'));
componentLoader.override('DefaultBulkDeleteAction', path.join(adminDir, 'components', 'BulkDelete'));
componentLoader.override('PropertyDescription', path.join(adminDir, 'components', 'PropertyDescription'));

export {
	componentLoader,
	orderStatusActionComponent,
	cancelOrderActionComponent,
	orderAuditTimelineActionComponent,
	orderShowComponent,
	orderFulfillmentActionComponent,
	orderPackingSlipActionComponent,
	orderReturnActionComponent,
	orderCsvExportActionComponent,
	orderBulkPackingSlipActionComponent,
	orderShippingLabelActionComponent,
	orderBulkShippingLabelActionComponent,
	orderTotalListComponent,
	orderTotalRangeFilterComponent,
	selectFilterWithPlaceholderComponent,
	userShowComponent,
	userSegmentsComponent,
	productScheduleDiscountActionComponent,
	productSchedulePublishActionComponent,
	productNameListComponent,
	productListComponent,
	productAttributeValueListComponent,
	orderListComponent,
	productShowComponent,
	productVariantMatrixComponent,
	productCsvImportExportActionComponent,
	productGalleryEditComponent,
	productTagsEditComponent,
	productNewComponent,
	productEditComponent,
	productActivityTimelineComponent,
	productBulkSetCategoryActionComponent,
	productBulkSetBrandActionComponent,
	productBulkEditTagsActionComponent,
	productBulkAdjustPriceActionComponent,
	productBulkAdjustStockActionComponent,
	productBulkToggleInStockActionComponent,
	productBulkSeoTemplateActionComponent,
	localizedTranslationsEditorComponent,
	reviewShowComponent,
	dashboardComponent,
};
