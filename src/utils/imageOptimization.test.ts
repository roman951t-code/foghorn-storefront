import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_IMAGES } from './demoImages';
import { shouldBypassImageOptimization } from './imageOptimization';
import { toPreviewImage } from './productImages';

test('serves precompressed demo photos and previews without Vercel transformations', () => {
	for (const src of DEMO_IMAGES) {
		assert.equal(shouldBypassImageOptimization(src), true);
		assert.equal(shouldBypassImageOptimization(toPreviewImage(src)), true);
	}
});

test('keeps optimization enabled for custom image sources', () => {
	for (const src of [
		'https://res.cloudinary.com/demo/image/upload/product.jpg',
		'/uploads/product.jpg',
		'/products/demo/custom.webp',
		'/assets/images/product-placeholder.svg',
	]) assert.equal(shouldBypassImageOptimization(src), false);
});
