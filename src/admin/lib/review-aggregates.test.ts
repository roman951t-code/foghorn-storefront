import assert from 'node:assert/strict';
import test from 'node:test';
import type { PrismaClient } from '@prisma/client';
import { syncProductReviewAggregates } from './review-aggregates.mts';

test('syncProductReviewAggregates normalizes ids and updates each unique product', async () => {
	const groupByCalls: Array<Record<string, unknown>> = [];
	const updates: Array<Record<string, unknown>> = [];

	const client = {
		review: {
			groupBy: async (args: Record<string, unknown>) => {
				groupByCalls.push(args);
				return [
					{ productId: 'product-1', _avg: { rating: 4.5 }, _count: { _all: 2 } },
					{ productId: 'product-2', _avg: { rating: 3 }, _count: { _all: 1 } },
				];
			},
		},
		product: {
			update: async (args: Record<string, unknown>) => {
				updates.push(args);
				return {};
			},
		},
	} as unknown as PrismaClient;

	await syncProductReviewAggregates(client, [' product-1 ', 'product-2', '', 'product-1']);

	assert.equal(groupByCalls.length, 1);
	assert.deepEqual(groupByCalls[0], {
		by: ['productId'],
		where: { productId: { in: ['product-1', 'product-2'] } },
		_avg: { rating: true },
		_count: { _all: true },
	});
	assert.equal(updates.length, 2);
	assert.deepEqual(updates, [
		{
			where: { id: 'product-1' },
			data: { averageRating: 4.5, reviewCount: 2 },
		},
		{
			where: { id: 'product-2' },
			data: { averageRating: 3, reviewCount: 1 },
		},
	]);
});

test('syncProductReviewAggregates writes zeros when product has no reviews', async () => {
	const updates: Array<Record<string, unknown>> = [];

	const client = {
		review: {
			groupBy: async () => [],
		},
		product: {
			update: async (args: Record<string, unknown>) => {
				updates.push(args);
				return {};
			},
		},
	} as unknown as PrismaClient;

	await syncProductReviewAggregates(client, ['product-3']);

	assert.deepEqual(updates, [
		{
			where: { id: 'product-3' },
			data: { averageRating: 0, reviewCount: 0 },
		},
	]);
});
