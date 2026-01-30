'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { PromoCard } from '@/data/navigation/promoCards';

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
}): PromoCard => ({
	id: banner.id,
	text: banner.title.trim(),
	subtitle: banner.subtitle?.trim() || undefined,
	href: banner.linkUrl?.trim() || undefined,
	linkLabel: banner.linkLabel?.trim() || undefined,
	imageUrl: banner.imageUrl?.trim() || undefined,
});

export async function getPromoCards(placement = 'promo'): Promise<PromoCard[]> {
	'use cache';
	cacheLife('minutes');
	cacheTag(PROMO_CACHE_TAG);

	const now = new Date();
	const whereBase = {
		isActive: true,
		...buildActiveWindowWhere(now),
	};

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
			},
			take: 12,
		});

	let banners = await loadByPlacement(placement);
	if (placement !== 'home' && banners.length === 0) {
		banners = await loadByPlacement('home');
	}

	return banners.map(mapBannerToPromo);
}
