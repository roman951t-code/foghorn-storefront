import assert from 'node:assert/strict';
import test from 'node:test';
import { computeProductEffectivePrice } from './productEffectivePrice';

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-06-01T12:00:00Z');

test('computeProductEffectivePrice returns basePrice when there is no discount', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: null,
		discountStartAt: null,
		discountEndAt: null,
		now,
	});
	assert.equal(price, 100);
});

test('computeProductEffectivePrice applies a permanent (no start/end) discount', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 80,
		discountStartAt: null,
		discountEndAt: null,
		now,
	});
	assert.equal(price, 80);
});

test('computeProductEffectivePrice applies a scheduled discount that is currently active', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 80,
		discountStartAt: new Date(now.getTime() - HOUR),
		discountEndAt: new Date(now.getTime() + HOUR),
		now,
	});
	assert.equal(price, 80);
});

test('computeProductEffectivePrice ignores a scheduled discount that has not started yet', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 80,
		discountStartAt: new Date(now.getTime() + HOUR),
		discountEndAt: new Date(now.getTime() + 2 * HOUR),
		now,
	});
	assert.equal(price, 100);
});

test('computeProductEffectivePrice ignores a scheduled discount that has already ended', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 80,
		discountStartAt: new Date(now.getTime() - 2 * HOUR),
		discountEndAt: new Date(now.getTime() - HOUR),
		now,
	});
	assert.equal(price, 100);
});

test('computeProductEffectivePrice rejects a discountPrice that is not below basePrice', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 100,
		discountStartAt: null,
		discountEndAt: null,
		now,
	});
	assert.equal(price, 100);
});

test('computeProductEffectivePrice uses the variant own discount when active', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: null,
		discountStartAt: null,
		discountEndAt: null,
		defaultVariant: {
			price: 150,
			discountPrice: 120,
			discountStartAt: null,
			discountEndAt: null,
		},
		now,
	});
	assert.equal(price, 120);
});

test('computeProductEffectivePrice cascades an active product-level discount onto the variant as an absolute amount', () => {
	// Product: 100 -> 80 (an active $20 discount).
	// Variant base price 150, no discount of its own -> should become 130.
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: 80,
		discountStartAt: null,
		discountEndAt: null,
		defaultVariant: {
			price: 150,
			discountPrice: null,
			discountStartAt: null,
			discountEndAt: null,
		},
		now,
	});
	assert.equal(price, 130);
});

test('computeProductEffectivePrice returns the variant base price when neither the variant nor the product has an active discount', () => {
	const price = computeProductEffectivePrice({
		basePrice: 100,
		discountPrice: null,
		discountStartAt: null,
		discountEndAt: null,
		defaultVariant: {
			price: 150,
			discountPrice: null,
			discountStartAt: null,
			discountEndAt: null,
		},
		now,
	});
	assert.equal(price, 150);
});

test('computeProductEffectivePrice defaults now to the current time when omitted', () => {
	const price = computeProductEffectivePrice({
		basePrice: 50,
		discountPrice: null,
		discountStartAt: null,
		discountEndAt: null,
	});
	assert.equal(price, 50);
});
