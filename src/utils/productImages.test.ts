import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { DEMO_IMAGES, isLegacyDemoImage, resolveDemoImage } from './demoImages';
import {
	buildProductImageGallery,
	PRODUCT_PLACEHOLDER_IMAGE,
	resolveProductPrimaryImage,
	resolveProductPrimaryImageFromGallery,
	toPreviewImage,
} from './productImages';
import { resolveCategoryImage, resolveSubcategoryImage } from './categoryImages';

test('existing Picsum and LoremFlickr database URLs resolve to bundled assets', () => {
	for (const src of [
		'https://picsum.photos/seed/android-phone-example/1100/1100',
		'https://fastly.picsum.photos/id/1018/900/900.jpg?hmac=signature',
		'https://loremflickr.com/1100/1100/camera?lock=1',
	]) {
		const resolved = resolveProductPrimaryImage(src);
		assert.ok(DEMO_IMAGES.some((image) => image === resolved));
		assert.equal(resolveDemoImage(resolved), resolved);
		assert.equal(resolveCategoryImage(src), resolved);
		assert.equal(resolveSubcategoryImage(null, src), resolved);
	}
});

test('demo assignment is deterministic and independent of requested Picsum size', () => {
	assert.equal(
		resolveDemoImage('https://picsum.photos/seed/test/1100/1100'),
		resolveDemoImage('https://picsum.photos/seed/test/640/640'),
	);
});

test('all photos, previews and the error fallback exist in public', () => {
	for (const src of [...DEMO_IMAGES, ...DEMO_IMAGES.map(toPreviewImage), PRODUCT_PLACEHOLDER_IMAGE]) {
		assert.ok(existsSync(new URL(`../../public${src}`, import.meta.url)), src);
	}
});

test('missing image values use the local fallback', () => {
	for (const src of [null, undefined, '', ' ', 'null', 'undefined', 'none', 'n/a', 'na', '-']) {
		assert.equal(resolveProductPrimaryImage(src), PRODUCT_PLACEHOLDER_IMAGE);
		assert.deepEqual(buildProductImageGallery(src), [PRODUCT_PLACEHOLDER_IMAGE]);
	}
});

test('persisted galleries retain order and deduplicate resolved demo images', () => {
	const legacy = 'https://picsum.photos/seed/example/1100/1100';
	const uploaded = 'https://res.cloudinary.com/demo/image/upload/real.webp?signature=abc';
	assert.deepEqual(buildProductImageGallery(null, [legacy, legacy, uploaded, uploaded]), [
		resolveDemoImage(legacy), uploaded,
	]);
	assert.equal(resolveProductPrimaryImageFromGallery(legacy, ['', uploaded]), uploaded);
});

test('demo primary generates bounded local gallery and supports single-image requests', () => {
	assert.equal(buildProductImageGallery(DEMO_IMAGES[0]).length, Math.min(4, DEMO_IMAGES.length));
	assert.deepEqual(buildProductImageGallery(DEMO_IMAGES[1], [], 1), [DEMO_IMAGES[1]]);
	assert.equal(buildProductImageGallery(DEMO_IMAGES[0], [], 99).length, DEMO_IMAGES.length);
});

test('custom and signed URLs never gain fabricated variants or lose their query', () => {
	for (const src of [
		'https://res.cloudinary.com/demo/product.jpg?signature=123&variant=real',
		'/uploads/real-product.webp',
		'https://notpicsum.photos/product.jpg',
		'https://picsum.photos.example.com/product.jpg',
	]) {
		assert.equal(isLegacyDemoImage(src), false);
		assert.equal(resolveProductPrimaryImage(src), src);
		assert.equal(toPreviewImage(src), src);
		assert.deepEqual(buildProductImageGallery(src), [src]);
	}
});

test('preview conversion is idempotent and handles old cached URLs', () => {
	const preview = toPreviewImage('https://picsum.photos/seed/example/1100/1100');
	assert.ok(preview.endsWith('-preview.webp'));
	assert.equal(toPreviewImage(preview), preview);
});
