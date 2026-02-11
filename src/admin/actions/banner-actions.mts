import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

export const duplicateBanner: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, resource, currentAdmin, h } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const bannerId = record.param('id') as string;
	const resourceId = typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;

	const banner = await prisma.banner.findUnique({
		where: { id: bannerId },
		select: {
			id: true,
			title: true,
			subtitle: true,
			imageUrl: true,
			linkLabel: true,
			linkUrl: true,
			placement: true,
			isActive: true,
			startsAt: true,
			endsAt: true,
			translations: {
				select: {
					locale: true,
					title: true,
					subtitle: true,
					linkLabel: true,
				},
			},
		},
	});

	if (!banner) {
		return { record: record.toJSON(currentAdmin), notice: { message: 'banner-not-found', type: 'error' } };
	}

	try {
		const created = await prisma.banner.create({
			data: {
				title: `${banner.title} (Copy)`,
				subtitle: banner.subtitle,
				imageUrl: banner.imageUrl,
				linkLabel: banner.linkLabel,
				linkUrl: banner.linkUrl,
				placement: banner.placement,
				isActive: false,
				startsAt: banner.startsAt,
				endsAt: banner.endsAt,
			},
		});
		if (banner.translations.length > 0) {
			await prisma.bannerTranslation.createMany({
				data: banner.translations.map((translation) => ({
					bannerId: created.id,
					locale: translation.locale,
					title:
						translation.locale === 'uk' ? `${translation.title} (Copy)` : translation.title,
					subtitle: translation.subtitle,
					linkLabel: translation.linkLabel,
				})),
				skipDuplicates: true,
			});
		}

		const createdRecord = await resource.findOne(created.id);
		const redirectUrl = h.recordActionUrl({ resourceId, recordId: created.id, actionName: 'show' });
		return {
			record: createdRecord ? createdRecord.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'banner-duplicated', type: 'success' },
			redirectUrl,
		};
	} catch {
		return { record: record.toJSON(currentAdmin), notice: { message: 'banner-duplicate-failed', type: 'error' } };
	}
};
