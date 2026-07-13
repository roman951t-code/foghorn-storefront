import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { env } from './src/config/env';
const isProd = env.NODE_ENV === 'production';
const enableProdBrowserSourceMaps = process.env.ENABLE_PROD_BROWSER_SOURCEMAPS === 'true';
const enableSentryDebug = process.env.SENTRY_DEBUG === 'true';

const baseConfig: NextConfig = {
	experimental: {
		// Reduce client bundle by rewriting imports to per-file entrypoints
		optimizePackageImports: ['@chakra-ui/icons', 'react-icons'],
	},
	productionBrowserSourceMaps: enableProdBrowserSourceMaps,
	cacheComponents: true,
	images: {
		deviceSizes: [640, 750, 828, 864, 1080, 1200, 1920, 2048, 3840],
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
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
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
				key: 'Cross-Origin-Resource-Policy',
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
			{
				key: 'Origin-Agent-Cluster',
				value: '?1',
			},
			{
				key: 'X-Permitted-Cross-Domain-Policies',
				value: 'none',
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

export default withSentryConfig(nextConfig, {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: !enableSentryDebug,
	debug: enableSentryDebug,
	telemetry: false,
	// `webpack.treeshake` (below) only takes effect on webpack builds, but this
	// project builds with Turbopack (see next.config.ts's own build output /
	// the SDK's own type docs: "If you build Next.js with turbopack, ... build-time
	// instrumentation" under `webpack` no longer applies) — so it was silently a
	// no-op. `bundleSizeOptimizations` is the bundler-agnostic equivalent.
	// Only `excludeDebugStatements` is enabled: `excludeTracing` would strip the
	// tracing code this app actively uses (NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
	// default 0.02), and the `excludeReplay*` flags only matter once
	// `replayIntegration` is actually added, which it isn't here.
	bundleSizeOptimizations: {
		excludeDebugStatements: true,
	},
	webpack: {
		treeshake: {
			removeDebugLogging: true,
		},
		automaticVercelMonitors: true,
	},
	sourcemaps: {
		disable: !process.env.SENTRY_AUTH_TOKEN,
		deleteSourcemapsAfterUpload: true,
	},
});
