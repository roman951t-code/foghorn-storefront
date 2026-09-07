import test from 'node:test';
import assert from 'node:assert/strict';
import {
	isBlockedServerFetchAddress,
	isBlockedServerFetchHostname,
} from './server-fetch-safety.mts';

test('blocks localhost and private IPv4 SSRF targets', () => {
	assert.equal(isBlockedServerFetchHostname('localhost'), true);
	assert.equal(isBlockedServerFetchHostname('127.0.0.1'), true);
	assert.equal(isBlockedServerFetchHostname('10.0.0.5'), true);
	assert.equal(isBlockedServerFetchHostname('192.168.1.20'), true);
	assert.equal(isBlockedServerFetchHostname('169.254.169.254'), true);
	assert.equal(isBlockedServerFetchAddress('172.16.0.1'), true);
	assert.equal(isBlockedServerFetchAddress('172.31.255.255'), true);
});

test('allows public SSRF targets by address shape', () => {
	assert.equal(isBlockedServerFetchHostname('example.com'), false);
	assert.equal(isBlockedServerFetchHostname('8.8.8.8'), false);
	assert.equal(isBlockedServerFetchAddress('1.1.1.1'), false);
});

test('blocks localhost and private IPv6 SSRF targets', () => {
	assert.equal(isBlockedServerFetchHostname('[::1]'), true);
	assert.equal(isBlockedServerFetchAddress('::ffff:127.0.0.1'), true);
	assert.equal(isBlockedServerFetchAddress('fe80::1'), true);
	assert.equal(isBlockedServerFetchAddress('fc00::1'), true);
	assert.equal(isBlockedServerFetchAddress('fd12::1'), true);
});
