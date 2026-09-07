import assert from 'node:assert/strict';
import test from 'node:test';
import { getActionErrorMessageKey } from './authActionError';

test('getActionErrorMessageKey prefers top-level message', () => {
	const message = getActionErrorMessageKey({
		message: 'Too many requests',
		body: { message: 'ignored' },
	});
	assert.equal(message, 'Too many requests');
});

test('getActionErrorMessageKey falls back to body.message', () => {
	const message = getActionErrorMessageKey({
		body: { message: 'phone_otp_provider_not_configured' },
	});
	assert.equal(message, 'phone_otp_provider_not_configured');
});

test('getActionErrorMessageKey returns empty string for unknown shapes', () => {
	assert.equal(getActionErrorMessageKey(null), '');
	assert.equal(getActionErrorMessageKey('bad'), '');
	assert.equal(getActionErrorMessageKey({ body: { message: 123 } }), '');
});
