import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_LOCALE = 'uk';
const OVERWRITE_EXISTING = process.argv.includes('--overwrite');

async function assertTranslationTablesExist() {
	try {
		await Promise.all([
			prisma.productTranslation.count(),
			prisma.productCategoryTranslation.count(),
			prisma.pageTranslation.count(),
			prisma.bannerTranslation.count(),
		]);
	} catch (error) {
		const maybePrismaError = error as { code?: string };
		if (maybePrismaError?.code === 'P2021') {
			throw new Error(
				[
					'Translation tables are missing.',
					'Run `npm run db:push` first to apply the updated Prisma schema, then rerun this script.',
				].join(' ')
			);
		}
		throw error;
	}
}

async function backfillProducts(locale: string, overwriteExisting: boolean) {
	const products = await prisma.product.findMany({
		select: {
			id: true,
			name: true,
			description: true,
			guarantee: true,
			metaTitle: true,
			metaDescription: true,
			categoryName: true,
			subcategoryName: true,
			slug: true,
			fullSlug: true,
		},
	});

	if (!products.length) return 0;

	if (!overwriteExisting) {
		const existingTranslations = await prisma.productTranslation.findMany({
			where: { locale },
			select: { productId: true },
		});
		const existingProductIds = new Set(existingTranslations.map((row) => row.productId));
		const missingProducts = products.filter((product) => !existingProductIds.has(product.id));
		if (!missingProducts.length) return 0;

		const result = await prisma.productTranslation.createMany({
			data: missingProducts.map((product) => ({
				productId: product.id,
				locale,
				name: product.name,
				description: product.description,
				guarantee: product.guarantee,
				metaTitle: product.metaTitle,
				metaDescription: product.metaDescription,
				categoryName: product.categoryName,
				subcategoryName: product.subcategoryName,
				slug: product.slug,
				fullSlug: product.fullSlug,
			})),
			skipDuplicates: true,
		});

		return result.count;
	}

	await Promise.all(
		products.map((product) =>
			prisma.productTranslation.upsert({
				where: {
					productId_locale: {
						productId: product.id,
						locale,
					},
				},
				update: {
					name: product.name,
					description: product.description,
					guarantee: product.guarantee,
					metaTitle: product.metaTitle,
					metaDescription: product.metaDescription,
					categoryName: product.categoryName,
					subcategoryName: product.subcategoryName,
					slug: product.slug,
					fullSlug: product.fullSlug,
				},
				create: {
					productId: product.id,
					locale,
					name: product.name,
					description: product.description,
					guarantee: product.guarantee,
					metaTitle: product.metaTitle,
					metaDescription: product.metaDescription,
					categoryName: product.categoryName,
					subcategoryName: product.subcategoryName,
					slug: product.slug,
					fullSlug: product.fullSlug,
				},
			})
		)
	);

	return products.length;
}

async function backfillCategories(locale: string, overwriteExisting: boolean) {
	const categories = await prisma.productCategory.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
		},
	});

	if (!categories.length) return 0;

	if (!overwriteExisting) {
		const existingTranslations = await prisma.productCategoryTranslation.findMany({
			where: { locale },
			select: { categoryId: true },
		});
		const existingCategoryIds = new Set(existingTranslations.map((row) => row.categoryId));
		const missingCategories = categories.filter((category) => !existingCategoryIds.has(category.id));
		if (!missingCategories.length) return 0;

		const result = await prisma.productCategoryTranslation.createMany({
			data: missingCategories.map((category) => ({
				categoryId: category.id,
				locale,
				name: category.name,
				slug: category.slug,
			})),
			skipDuplicates: true,
		});

		return result.count;
	}

	await Promise.all(
		categories.map((category) =>
			prisma.productCategoryTranslation.upsert({
				where: {
					categoryId_locale: {
						categoryId: category.id,
						locale,
					},
				},
				update: {
					name: category.name,
					slug: category.slug,
				},
				create: {
					categoryId: category.id,
					locale,
					name: category.name,
					slug: category.slug,
				},
			})
		)
	);

	return categories.length;
}

async function backfillPages(locale: string, overwriteExisting: boolean) {
	const pages = await prisma.page.findMany({
		select: {
			id: true,
			title: true,
			slug: true,
			excerpt: true,
			content: true,
			metaTitle: true,
			metaDescription: true,
		},
	});

	if (!pages.length) return 0;

	if (!overwriteExisting) {
		const existingTranslations = await prisma.pageTranslation.findMany({
			where: { locale },
			select: { pageId: true },
		});
		const existingPageIds = new Set(existingTranslations.map((row) => row.pageId));
		const missingPages = pages.filter((page) => !existingPageIds.has(page.id));
		if (!missingPages.length) return 0;

		const result = await prisma.pageTranslation.createMany({
			data: missingPages.map((page) => ({
				pageId: page.id,
				locale,
				title: page.title,
				slug: page.slug,
				excerpt: page.excerpt,
				content: page.content,
				metaTitle: page.metaTitle,
				metaDescription: page.metaDescription,
			})),
			skipDuplicates: true,
		});

		return result.count;
	}

	await Promise.all(
		pages.map((page) =>
			prisma.pageTranslation.upsert({
				where: {
					pageId_locale: {
						pageId: page.id,
						locale,
					},
				},
				update: {
					title: page.title,
					slug: page.slug,
					excerpt: page.excerpt,
					content: page.content,
					metaTitle: page.metaTitle,
					metaDescription: page.metaDescription,
				},
				create: {
					pageId: page.id,
					locale,
					title: page.title,
					slug: page.slug,
					excerpt: page.excerpt,
					content: page.content,
					metaTitle: page.metaTitle,
					metaDescription: page.metaDescription,
				},
			})
		)
	);

	return pages.length;
}

async function backfillBanners(locale: string, overwriteExisting: boolean) {
	const banners = await prisma.banner.findMany({
		select: {
			id: true,
			title: true,
			subtitle: true,
			linkLabel: true,
		},
	});

	if (!banners.length) return 0;

	if (!overwriteExisting) {
		const existingTranslations = await prisma.bannerTranslation.findMany({
			where: { locale },
			select: { bannerId: true },
		});
		const existingBannerIds = new Set(existingTranslations.map((row) => row.bannerId));
		const missingBanners = banners.filter((banner) => !existingBannerIds.has(banner.id));
		if (!missingBanners.length) return 0;

		const result = await prisma.bannerTranslation.createMany({
			data: missingBanners.map((banner) => ({
				bannerId: banner.id,
				locale,
				title: banner.title,
				subtitle: banner.subtitle,
				linkLabel: banner.linkLabel,
			})),
			skipDuplicates: true,
		});

		return result.count;
	}

	await Promise.all(
		banners.map((banner) =>
			prisma.bannerTranslation.upsert({
				where: {
					bannerId_locale: {
						bannerId: banner.id,
						locale,
					},
				},
				update: {
					title: banner.title,
					subtitle: banner.subtitle,
					linkLabel: banner.linkLabel,
				},
				create: {
					bannerId: banner.id,
					locale,
					title: banner.title,
					subtitle: banner.subtitle,
					linkLabel: banner.linkLabel,
				},
			})
		)
	);

	return banners.length;
}

async function main() {
	const modeLabel = OVERWRITE_EXISTING ? 'overwrite' : 'missing-only';
	const rowActionLabel = OVERWRITE_EXISTING ? 'synced' : 'inserted';
	console.log(`Starting localization backfill for locale "${DEFAULT_LOCALE}" (${modeLabel})...`);
	await assertTranslationTablesExist();

	const [productRows, categoryRows, pageRows, bannerRows] = await Promise.all([
		backfillProducts(DEFAULT_LOCALE, OVERWRITE_EXISTING),
		backfillCategories(DEFAULT_LOCALE, OVERWRITE_EXISTING),
		backfillPages(DEFAULT_LOCALE, OVERWRITE_EXISTING),
		backfillBanners(DEFAULT_LOCALE, OVERWRITE_EXISTING),
	]);

	console.log(
		[
			'Localization backfill completed.',
			`ProductTranslation rows ${rowActionLabel}: ${productRows}`,
			`ProductCategoryTranslation rows ${rowActionLabel}: ${categoryRows}`,
			`PageTranslation rows ${rowActionLabel}: ${pageRows}`,
			`BannerTranslation rows ${rowActionLabel}: ${bannerRows}`,
		].join('\n')
	);
}

main()
	.catch((error) => {
		console.error('Localization backfill failed:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
