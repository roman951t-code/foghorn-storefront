import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcePath = new URL('./index.mts', import.meta.url);

const expectedSnippets = [
	['Product edit', 'after: productEditAfterHook'],
	[
		'Product bulk category',
		'withCacheRevalidationHandler(bulkSetCategory, getProductMutationTags)',
	],
	['Product bulk brand', 'withCacheRevalidationHandler(bulkSetBrand, getProductMutationTags)'],
	['Product bulk tags', 'withCacheRevalidationHandler(bulkEditTags, getProductMutationTags)'],
	['Product bulk price', 'withCacheRevalidationHandler(bulkAdjustPrice, getProductMutationTags)'],
	['Product bulk stock', 'withCacheRevalidationHandler(bulkAdjustStock, getProductMutationTags)'],
	['Product publish', 'withCacheRevalidationHandler(publishProduct, getProductMutationTags)'],
	['Product archive', 'withCacheRevalidationHandler(archiveProduct, getProductMutationTags)'],
	['Product duplicate', 'withCacheRevalidationHandler(duplicateProduct, getProductMutationTags)'],
	[
		'Product discount schedule',
		'withCacheRevalidationHandler(scheduleDiscount, getProductMutationTags)',
	],
	[
		'Product publish schedule',
		'withCacheRevalidationHandler(schedulePublish, getProductMutationTags)',
	],
	['Product delete', 'withCacheRevalidationHandler(deleteProduct, getProductMutationTags)'],
	['ProductCategory mutations', 'getProductCategoryMutationTags'],
	['Product images', 'getProductImageMutationTags'],
	['Product metadata', 'getProductMetadataMutationTags'],
	['Product attribute values', 'getProductAttributeValueMutationTags'],
	['Banner mutations', 'getBannerMutationTags'],
	['Page mutations', 'getPageMutationTags'],
	['Storefront form mutations', 'getStorefrontFormMutationTags'],
	['Review mutations', 'reviewMutationAfterHook'],
] as const;

test('AdminJS storefront resources keep cache revalidation coverage', async () => {
	const source = await readFile(sourcePath, 'utf8');

	for (const [label, snippet] of expectedSnippets) {
		assert.ok(source.includes(snippet), `${label} is missing cache revalidation coverage`);
	}
});
