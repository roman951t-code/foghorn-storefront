import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldBypassImageOptimization } from './imageOptimization';

test('bypasses optimization for Picsum images', () => {
	assert.equal(
		shouldBypassImageOptimization('https://picsum.photos/seed/product/1100/1100'),
		true,
	);
	assert.equal(
		shouldBypassImageOptimization('https://fastly.picsum.photos/id/1/1100/1100.jpg'),
		true,
	);
});

test('keeps optimization enabled for other image sources', () => {
	assert.equal(
		shouldBypassImageOptimization('https://res.cloudinary.com/demo/image/upload/product.jpg'),
		false,
	);
	assert.equal(shouldBypassImageOptimization('/assets/images/product-placeholder.svg'), false);
	assert.equal(shouldBypassImageOptimization('https://notpicsum.photos/product.jpg'), false);
});
