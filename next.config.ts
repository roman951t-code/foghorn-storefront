import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
const isProd = process.env.NODE_ENV === 'production';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const baseConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@chakra-ui/react'],
	},
	productionBrowserSourceMaps: true,

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

export default withNextIntl(baseConfig);
