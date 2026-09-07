import assert from 'node:assert/strict';
import test from 'node:test';
import { asErrorDetails, resolveSafeRedirectUrl } from './route-utils';

const ORIGIN = 'https://shop.example.com';

test('resolveSafeRedirectUrl keeps only same-origin redirects', () => {
	const sameOriginAbsolute = resolveSafeRedirectUrl('https://shop.example.com/checkout', {
		origin: ORIGIN,
		fallbackPath: '/fallback',
	});
	assert.equal(sameOriginAbsolute, 'https://shop.example.com/checkout');

	const sameOriginRelative = resolveSafeRedirectUrl('/cabinet/orders?ok=1', {
		origin: ORIGIN,
		fallbackPath: '/fallback',
	});
	assert.equal(sameOriginRelative, 'https://shop.example.com/cabinet/orders?ok=1');

	const external = resolveSafeRedirectUrl('https://evil.example/phish', {
		origin: ORIGIN,
		fallbackPath: '/fallback',
	});
	assert.equal(external, 'https://shop.example.com/fallback');
});

test('resolveSafeRedirectUrl falls back for invalid candidate values', () => {
	const fallback = 'https://shop.example.com/fallback';
	assert.equal(
		resolveSafeRedirectUrl('', { origin: ORIGIN, fallbackPath: '/fallback' }),
		fallback
	);
	assert.equal(
		resolveSafeRedirectUrl(123, { origin: ORIGIN, fallbackPath: '/fallback' }),
		fallback
	);
	assert.equal(
		resolveSafeRedirectUrl('x'.repeat(2050), { origin: ORIGIN, fallbackPath: '/fallback' }),
		fallback
	);
});

test('asErrorDetails extracts only supported properties', () => {
	assert.deepEqual(asErrorDetails(null), {});
	assert.deepEqual(asErrorDetails({}), {});
	assert.deepEqual(
		asErrorDetails({
			statusCode: 402,
			code: 'stripe_declined',
			message: 'Card was declined',
			extra: true,
		}),
		{
			statusCode: 402,
			code: 'stripe_declined',
			message: 'Card was declined',
		}
	);
	assert.deepEqual(
		asErrorDetails({ statusCode: '500', code: 123, message: ['bad'] }),
		{}
	);
});
