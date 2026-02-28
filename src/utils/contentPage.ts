import type { Metadata } from 'next';

type PageMeta = {
	title?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	excerpt?: string | null;
};

type FaqItem = { question: string; answer: string };

export function mergePageMetadata(base: Metadata, page: PageMeta | null): Metadata {
	if (!page) return base;

	const title = page.metaTitle?.trim() || page.title?.trim();
	const description = page.metaDescription?.trim() || page.excerpt?.trim();

	if (!title && !description) return base;

	return {
		...base,
		...(title ? { title } : {}),
		...(description ? { description } : {}),
		openGraph:
			base.openGraph && typeof base.openGraph === 'object'
				? {
						...base.openGraph,
						...(title ? { title } : {}),
						...(description ? { description } : {}),
					}
				: base.openGraph,
		twitter:
			base.twitter && typeof base.twitter === 'object'
				? {
						...base.twitter,
						...(title ? { title } : {}),
						...(description ? { description } : {}),
					}
				: base.twitter,
	};
}

export function parseFaqContent(content?: string | null): FaqItem[] | null {
	if (!content) return null;
	try {
		const parsed = JSON.parse(content);
		if (!Array.isArray(parsed)) return null;
		const items = parsed.filter(
			(item) =>
				item &&
				typeof item === 'object' &&
				typeof item.question === 'string' &&
				typeof item.answer === 'string'
		);
		return items.length > 0 ? items : null;
	} catch {
		return null;
	}
}
