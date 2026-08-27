// One-off / re-run-as-needed notifier for the IndexNow protocol (Bing, Yandex,
// Seznam, Naver — not Google, which doesn't support it). Requires the key file
// at public/<INDEXNOW_KEY>.txt to already be live in production; running this
// before deploy will submit URLs IndexNow can't yet verify ownership for.
import { routing } from '@/i18n/routing';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';

const INDEXNOW_KEY = 'adbbf74602dbd5a083d04891be467226';
const APP_URL = new URL(
	process.env.NEXT_PUBLIC_APP_URL ?? 'https://shop.foghornbay.com',
).origin;
const SITEMAP_URL = `${APP_URL}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;

function localizePath(locale: string, path: string): string {
	if (locale === routing.defaultLocale) return path;
	return `/${locale}${path}`;
}

const fallbackUrls = () =>
	routing.locales.flatMap((locale) =>
		SITEMAP_STATIC_PATHS.map(({ path }) => `${APP_URL}${localizePath(locale, path)}`),
	);

const decodeXmlText = (value: string) =>
	value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");

async function getSitemapUrls() {
	try {
		const response = await fetch(SITEMAP_URL, {
			headers: { Accept: 'application/xml, text/xml;q=0.9' },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		const xml = await response.text();
		const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
			.map((match) => decodeXmlText(match[1]?.trim() ?? ''))
			.filter((value) => {
				try {
					return new URL(value).origin === APP_URL;
				} catch {
					return false;
				}
			});

		if (urls.length === 0) throw new Error('sitemap contains no same-origin URLs');
		return [...new Set(urls)];
	} catch (error) {
		console.warn(`Could not read ${SITEMAP_URL}; submitting static fallback URLs.`, error);
		return fallbackUrls();
	}
}

async function main() {
	const urlList = await getSitemapUrls();

	for (let offset = 0; offset < urlList.length; offset += MAX_URLS_PER_REQUEST) {
		const batch = urlList.slice(offset, offset + MAX_URLS_PER_REQUEST);
		const response = await fetch(INDEXNOW_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({
				host: new URL(APP_URL).host,
				key: INDEXNOW_KEY,
				keyLocation: `${APP_URL}/${INDEXNOW_KEY}.txt`,
				urlList: batch,
			}),
		});

		console.log(
			`IndexNow submit: HTTP ${response.status} for ${batch.length} URLs (${offset + 1}-${offset + batch.length} of ${urlList.length})`,
		);
		if (!response.ok) {
			const details = await response.text();
			throw new Error(details || `IndexNow returned HTTP ${response.status}`);
		}
	}
}

main().catch((error) => {
	console.error('IndexNow submission failed:', error);
	process.exitCode = 1;
});
