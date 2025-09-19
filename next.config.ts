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

	images: {
		domains: ['images.unsplash.com', 'loremflickr.com', 'picsum.photos'],
	},
	...(isProd && {
		async headers() {
			return [
				{
					source: '/(.*)',
					headers: [
						{
							key: 'Content-Security-Policy',
							value: cspHeader.replace(/\n/g, ''),
						},
					],
				},
			];
		},
	}),
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(baseConfig);
