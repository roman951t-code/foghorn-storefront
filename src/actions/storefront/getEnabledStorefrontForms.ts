'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { StorefrontFormPlacement } from '@prisma/client';

const STOREFRONT_FORMS_CACHE_TAG = 'storefront-forms';

export type StorefrontFormPublic = {
	key: string;
	placement: StorefrontFormPlacement;
	title: string;
	description: string | null;
	body: string | null;
	enabled: boolean;
	required: boolean;
	checkboxLabel: string | null;
	linkLabel: string | null;
	linkHref: string | null;
	acceptLabel: string | null;
	declineLabel: string | null;
	sortOrder: number;
};

export async function getEnabledStorefrontForms(placement: StorefrontFormPlacement) {
	'use cache';
	cacheLife('hours');
	cacheTag(STOREFRONT_FORMS_CACHE_TAG, `storefront-forms:${placement}`);

	return prisma.storefrontForm.findMany({
		where: { placement, enabled: true },
		orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
		select: {
			key: true,
			placement: true,
			title: true,
			description: true,
			body: true,
			enabled: true,
			required: true,
			checkboxLabel: true,
			linkLabel: true,
			linkHref: true,
			acceptLabel: true,
			declineLabel: true,
			sortOrder: true,
		},
	}) satisfies Promise<StorefrontFormPublic[]>;
}
