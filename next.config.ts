import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@chakra-ui/react'],
	},
	images: {
		domains: ['images.unsplash.com'],
	},
};

export default withNextIntl(nextConfig);
