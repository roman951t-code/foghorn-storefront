'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { PromoCard } from '@/data/navigation/promoCards';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';

const PROMO_CACHE_TAG = 'promo-cards';

const buildActiveWindowWhere = (now: Date) => ({
	AND: [
		{
			OR: [{ startsAt: null }, { startsAt: { lte: now } }],
		},
		{
			OR: [{ endsAt: null }, { endsAt: { gt: now } }],
		},
	],
});

const mapBannerToPromo = (banner: {
	id: string;
	title: string;
	subtitle: string | null;
	linkUrl: string | null;
	linkLabel: string | null;
	imageUrl: string;
	translations: Array<{
		locale: string;
		title: string;
		subtitle: string | null;
		linkLabel: string | null;
	}>;
},
locale: string
): PromoCard => {
	const translation = pickLocalizedTranslation(banner.translations, locale);
	const title = translation?.title ?? banner.title;
	const subtitle = translation?.subtitle ?? banner.subtitle;
	const linkLabel = translation?.linkLabel ?? banner.linkLabel;

	return {
		id: banner.id,
		text: title.trim(),
		subtitle: subtitle?.trim() || undefined,
		href: banner.linkUrl?.trim() || undefined,
		linkLabel: linkLabel?.trim() || undefined,
		imageUrl: banner.imageUrl?.trim() || undefined,
	};
};

export async function getPromoCards(
	placement = 'promo',
	locale: string = DEFAULT_LOCALE
): Promise<PromoCard[]> {
	'use cache';
	cacheLife('days');
	cacheTag(PROMO_CACHE_TAG);

	const now = new Date();
	const whereBase = {
		isActive: true,
		...buildActiveWindowWhere(now),
	};
	const localeFallbacks = getLocaleFallbacks(locale);

	const loadByPlacement = async (placementValue: string) =>
		prisma.banner.findMany({
			where: { ...whereBase, placement: placementValue },
			orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
			select: {
				id: true,
				title: true,
				subtitle: true,
				linkUrl: true,
				linkLabel: true,
				imageUrl: true,
				translations: {
					where: { locale: { in: localeFallbacks } },
					select: {
						locale: true,
						title: true,
						subtitle: true,
						linkLabel: true,
					},
					orderBy: { updatedAt: 'desc' },
				},
			},
			take: 12,
		});

	let banners = await loadByPlacement(placement);
	if (placement !== 'home' && banners.length === 0) {
		banners = await loadByPlacement('home');
	}

	return banners.map((banner) => mapBannerToPromo(banner, locale));
}
