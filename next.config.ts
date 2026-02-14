import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import { env } from './src/config/env';
const isProd = env.NODE_ENV === 'production';
const enableProdBrowserSourceMaps = process.env.ENABLE_PROD_BROWSER_SOURCEMAPS === 'true';

const baseConfig: NextConfig = {
	experimental: {
		// Reduce client bundle by rewriting imports to per-file entrypoints
		optimizePackageImports: ['@chakra-ui/icons', 'react-icons'],
	},
	productionBrowserSourceMaps: enableProdBrowserSourceMaps,
	cacheComponents: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
			{
				protocol: 'https',
				hostname: 'fastly.picsum.photos',
			},
		],
		qualities: [68, 75],
	},
	async headers() {
		const commonHeaders = [
			{
				key: 'Cross-Origin-Opener-Policy',
				value: 'same-origin',
			},
			{
				key: 'X-Frame-Options',
				value: 'DENY',
			},
			{
				key: 'X-Content-Type-Options',
				value: 'nosniff',
			},
			{
				key: 'Referrer-Policy',
				value: 'strict-origin-when-cross-origin',
			},
			{
				key: 'Permissions-Policy',
				value: 'camera=(), microphone=(), geolocation=(), payment=()',
			},
		];

		const prodHeaders = [
			{
				key: 'Strict-Transport-Security',
				value: 'max-age=31536000; includeSubDomains',
			},
		];

		return [
			{
				source: '/(.*)',
				headers: [...commonHeaders, ...(isProd ? prodHeaders : [])],
			},
		];
	},
	logging: {
		fetches: {
			fullUrl: !isProd,
		},
	},
};

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withNextIntl(withBundleAnalyzer(baseConfig));

export default nextConfig;
