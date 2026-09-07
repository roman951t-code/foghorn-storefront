import assert from 'node:assert/strict';
import test from 'node:test';
import { createSerialTaskQueue } from './serialTaskQueue';

test('runs a wishlist removal only after the guest wishlist merge finishes', async () => {
	const enqueue = createSerialTaskQueue();
	const events: string[] = [];
	let finishMerge!: () => void;
	const mergeGate = new Promise<void>((resolve) => {
		finishMerge = resolve;
	});

	const merge = enqueue(async () => {
		events.push('merge:start');
		await mergeGate;
		events.push('merge:end');
	});
	const remove = enqueue(async () => {
		events.push('remove');
	});

	await Promise.resolve();
	assert.deepEqual(events, ['merge:start']);

	finishMerge();
	await Promise.all([merge, remove]);
	assert.deepEqual(events, ['merge:start', 'merge:end', 'remove']);
});

test('continues with the next wishlist operation after a failed operation', async () => {
	const enqueue = createSerialTaskQueue();
	const events: string[] = [];

	const failed = enqueue(async () => {
		events.push('failed');
		throw new Error('expected test failure');
	});
	const next = enqueue(async () => {
		events.push('next');
	});

	await assert.rejects(failed, /expected test failure/);
	await next;
	assert.deepEqual(events, ['failed', 'next']);
});
