import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import { env } from './src/config/env';
const isProd = env.NODE_ENV === 'production';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const baseConfig: NextConfig = {
	experimental: {
		// Reduce client bundle by rewriting imports to per-file entrypoints
		optimizePackageImports: ['@chakra-ui/icons', 'react-icons'],
	},
	productionBrowserSourceMaps: true,
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
				key: 'Content-Security-Policy',
				value: cspHeader.replace(/\n/g, ''),
			},
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
