import assert from 'node:assert/strict';
import test from 'node:test';
import {
	APP_URL,
	buildAbsoluteTitle,
	buildLanguageAlternates,
	normalizeMetadataTitle,
} from './seo';

test('normalizeMetadataTitle removes current and legacy site-name suffixes', () => {
	assert.equal(
		normalizeMetadataTitle('Pulse Compact Air | Cameras | Online Store'),
		'Pulse Compact Air | Cameras',
	);
	assert.equal(
		normalizeMetadataTitle('Pulse Compact Air — FOGHORNBAY'),
		'Pulse Compact Air',
	);
	assert.equal(normalizeMetadataTitle('Pulse Compact Air'), 'Pulse Compact Air');
});

test('buildAbsoluteTitle appends the canonical site name exactly once', () => {
	assert.equal(
		buildAbsoluteTitle('Electronics | Online Store'),
		'Electronics | FOGHORNBAY',
	);
});

test('buildLanguageAlternates emits canonical, reciprocal locales, and x-default', () => {
	const alternates = buildLanguageAlternates('en', '/products/cameras');

	assert.equal(alternates.canonical, new URL('/en/products/cameras', APP_URL).toString());
	assert.equal(alternates.languages.uk, new URL('/products/cameras', APP_URL).toString());
	assert.equal(
		alternates.languages['en-US'],
		new URL('/en/products/cameras', APP_URL).toString(),
	);
	assert.equal(
		alternates.languages['x-default'],
		new URL('/products/cameras', APP_URL).toString(),
	);
});
