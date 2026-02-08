import { Prisma, PrismaClient, OrderStatus, StorefrontFormPlacement } from '@prisma/client';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
type SeedProduct = {
	id: string;
	inStock: boolean;
	basePrice: Prisma.Decimal;
	discountPrice: Prisma.Decimal | null;
};

function createSlug(text: string) {
	return slugify(text, { lower: true, strict: true });
}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

const fallbackProductImages = [
	'/assets/images/temp/1Big.webp',
	'/assets/images/temp/2Big.webp',
	'/assets/images/temp/3Big.webp',
	'/assets/images/temp/4Big.webp',
];

const fallbackCategoryImages = [
	'/assets/images/temp/2Big.webp',
	'/assets/images/temp/3Big.webp',
	'/assets/images/temp/4Big.webp',
];

const mainCategories = [
	'Smartphones',
	'Tablets',
	'Laptops & PCs',
	'TVs',
	'Cameras',
	'Audio',
	'Gaming',
	'Accessories',
];

const subcategoriesMap: Record<string, string[]> = {
	Smartphones: ['Android Phones', 'iPhones'],
	Tablets: ['Android Tablets', 'iPads'],
	'Laptops & PCs': ['Laptops', 'Ultrabooks', 'Gaming Laptops', 'Desktops', 'Monitors'],
	TVs: ['4K TVs', 'Smart TVs'],
	Cameras: ['Mirrorless Cameras', 'Action Cameras'],
	Audio: ['Headphones', 'Speakers', 'Soundbars'],
	Gaming: ['Consoles', 'Controllers', 'VR Headsets'],
	Accessories: ['Chargers', 'Cables', 'Cases'],
};

const categoryImageKeywords: Record<string, string> = {
	Smartphones: 'smartphone',
	Tablets: 'tablet',
	'Laptops & PCs': 'laptop',
	TVs: 'television',
	Cameras: 'camera',
	Audio: 'headphones',
	Gaming: 'game-console',
	Accessories: 'tech-accessories',
};

const subcategoryImageKeywords: Record<string, string> = {
	'Android Phones': 'android-phone',
	iPhones: 'iphone',
	'Android Tablets': 'android-tablet',
	iPads: 'ipad-tablet',
	Laptops: 'laptop',
	Ultrabooks: 'ultrabook',
	'Gaming Laptops': 'gaming-laptop',
	Desktops: 'desktop-computer',
	Monitors: 'computer-monitor',
	'4K TVs': '4k-tv',
	'Smart TVs': 'smart-tv',
	'Mirrorless Cameras': 'mirrorless-camera',
	'Action Cameras': 'action-camera',
	Chargers: 'device-charger',
	Cables: 'charging-cable',
	Headphones: 'headphones',
	Speakers: 'bluetooth-speaker',
	Soundbars: 'soundbar',
	Consoles: 'game-console',
	Controllers: 'game-controller',
	'VR Headsets': 'vr-headset',
	Cases: 'phone-case',
};

function stablePick<T>(items: T[], seed: string) {
	const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return items[hash % items.length];
}

function buildKeywordImage(keyword: string, width: number, height: number, seed: string) {
	const normalizedKeyword = encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'));
	return `https://picsum.photos/seed/${normalizedKeyword}-${seed}/${width}/${height}`;
}

const getCategoryImage = (name: string) => {
	const keyword = categoryImageKeywords[name] ?? subcategoryImageKeywords[name] ?? 'tech-gadgets';
	const seed = createSlug(name);
	return buildKeywordImage(keyword, 900, 900, seed) || stablePick(fallbackCategoryImages, seed);
};

const getSubcategoryImage = (sub: string, seed: string) => {
	const keyword = subcategoryImageKeywords[sub] ?? categoryImageKeywords[sub] ?? 'tech-gadgets';
	return buildKeywordImage(keyword, 900, 900, seed) || stablePick(fallbackProductImages, seed);
};

const VARIANT_OPTIONS = {
	colors: ['Black', 'White', 'Blue', 'Green', 'Silver'],
	storage: ['128', '256', '512'],
	ram: ['8', '16', '32'],
	diagonal: ['27', '32', '55', '65'],
	refresh: ['60', '120', '144'],
};

const PRODUCT_ATTRIBUTE_OPTIONS = {
	models: [
		'AX-100',
		'AX-200',
		'AX-300',
		'ZN-100',
		'ZN-200',
		'ZN-300',
		'VT-100',
		'VT-200',
	],
	weightsKg: ['0.18', '0.22', '0.28', '0.45', '0.75', '1.20'], // kg
	sizesMm: ['90', '120', '150', '210', '320', '420'], // mm
	batteryMah: ['3500', '4500', '5000', '6000', '8000', '10000'], // mAh
};

type VariantTemplate = {
	attributes: Record<string, string>;
	priceDelta: number;
};

const buildVariantTemplates = (category: string): VariantTemplate[] => {
	const pick = (values: string[], count: number) =>
		faker.helpers.arrayElements(values, Math.min(count, values.length));

	const colors = pick(VARIANT_OPTIONS.colors, 2);
	const storage = pick(VARIANT_OPTIONS.storage, 2);
	const ram = pick(VARIANT_OPTIONS.ram, 2);
	const diagonal = pick(VARIANT_OPTIONS.diagonal, 2);
	const refresh = pick(VARIANT_OPTIONS.refresh, 2);

	const combos: VariantTemplate[] = [];
	const addCombo = (attributes: Record<string, string>) => {
		combos.push({
			attributes,
			priceDelta: faker.number.int({ min: 0, max: 200 }),
		});
	};

	switch (category) {
		case 'Smartphones':
		case 'Tablets':
			for (const color of colors) {
				for (const size of storage) {
					addCombo({ Колір: color, "Памʼять": size });
				}
			}
			break;
		case 'Laptops & PCs':
			for (const ramSize of ram) {
				for (const size of storage) {
					addCombo({ ОЗП: ramSize, "Памʼять": size });
				}
			}
			break;
		case 'TVs':
			for (const size of diagonal) {
				for (const hz of refresh) {
					addCombo({ Діагональ: size, Частота: hz });
				}
			}
			break;
		case 'Cameras':
			for (const color of colors) {
				for (const size of storage) {
					addCombo({ Колір: color, "Памʼять": size });
				}
			}
			break;
		case 'Audio':
		case 'Accessories':
			for (const color of colors) {
				addCombo({ Колір: color });
			}
			break;
		case 'Gaming':
			for (const size of storage) {
				addCombo({ "Памʼять": size });
			}
			break;
		default:
			for (const color of colors) {
				addCombo({ Колір: color });
			}
	}

	const minCount = 2;
	const maxCount = Math.min(4, combos.length);
	const takeCount = faker.number.int({ min: minCount, max: Math.max(minCount, maxCount) });
	return faker.helpers.shuffle(combos).slice(0, takeCount);
};

function needsImageReplacement(url?: string | null) {
	if (!url) return true;
	try {
		const hostname = new URL(url).hostname;
		return !(hostname.includes('picsum.photos') || hostname.includes('loremflickr.com'));
	} catch {
		return true;
	}
}

async function main() {
	console.log('🌱 Seeding started...');

	// Seed expects the database schema to be up-to-date. In this repo we typically use `prisma db push`
	// (no migrations folder). If the schema wasn't applied, seeding will fail with cryptic "table does not exist".
	try {
		await prisma.storefrontForm.count();
	} catch (e) {
		const maybePrismaError = e as { code?: string; message?: string } | null;
		if (maybePrismaError?.code === 'P2021') {
			throw new Error(
				[
					'Database schema is not up to date (missing table for StorefrontForm).',
					'Run `npx prisma db push --schema prisma/schema.prisma` and then rerun the seed.',
				].join(' ')
			);
		}
		throw e;
	}

	// Seed is meant to be repeatable during development. Since products are created with random slugs,
	// rerunning the seed without cleanup will accumulate products/attributes and explode filter option counts.
	console.log('🧹 Clearing existing catalog data...');
	await prisma.$transaction([
		prisma.cartItem.deleteMany({}),
		prisma.cart.deleteMany({}),
		prisma.wishlist.deleteMany({}),
		prisma.review.deleteMany({}),
		prisma.recentlyViewed.deleteMany({}),
		prisma.orderItem.deleteMany({}),
		prisma.orderDiscount.deleteMany({}),
		prisma.orderAuditEntry.deleteMany({}),
		prisma.order.deleteMany({}),
		prisma.productAttributeValue.deleteMany({}),
		prisma.product.deleteMany({}),
	]);

	if (mainCategories.length !== 8) {
		throw new Error(`Seed expects exactly 8 main categories, got ${mainCategories.length}`);
	}

	// Brands
	const brandNames = [
		'TechBrand',
		'NovaGear',
		'Pulse',
		'Auron',
		'Skyline',
		'Zenbit',
		'Voltix',
		'Axis',
	];
	const brands = await Promise.all(
		brandNames.map(async (name) => {
			const slug = createSlug(name);
			const logoUrl = buildKeywordImage('brand-logo', 160, 160, slug);
			return prisma.brand.upsert({
				where: { slug },
				update: { name, logoUrl },
				create: { name, slug, logoUrl },
			});
		})
	);

	// Attributes
	const productAttributeNames = [
		{ name: 'Вага', unit: 'кг' },
		{ name: 'Розмір', unit: 'мм' },
		{ name: 'Модель', unit: '' },
		{ name: 'Колір', unit: '' },
		{ name: 'Батарея', unit: 'мА·г' },
	];

	const variantAttributeNames = [
		{ name: 'Колір', unit: '' },
		{ name: 'Памʼять', unit: 'ГБ' },
		{ name: 'ОЗП', unit: 'ГБ' },
		{ name: 'Діагональ', unit: '"' },
		{ name: 'Частота', unit: 'Гц' },
	];

	const attributeByName = new Map<string, { id: string; name: string; unit: string | null }>();
	const allAttributeNames = [...productAttributeNames, ...variantAttributeNames];
	for (const attr of allAttributeNames) {
		const record = await prisma.productAttribute.upsert({
			where: { name: attr.name },
			update: { unit: attr.unit },
			create: { name: attr.name, unit: attr.unit },
		});
		attributeByName.set(record.name, record);
	}

	const TAGS = ['popular', 'new', 'discount', 'promotional', 'viewed'];
	const allProducts: SeedProduct[] = [];

	const getAttributeId = (name: string) => {
		const attr = attributeByName.get(name);
		if (!attr) throw new Error(`Missing ProductAttribute "${name}" in seed`);
		return attr.id;
	};

	const buildProductAttributeValueCreates = (category: string) => {
		const create: { attributeId: string; value: string }[] = [];
		const add = (name: string, value: string | number) => {
			create.push({ attributeId: getAttributeId(name), value: String(value) });
		};

		// "Real world" baseline fields most products can have.
		add('Модель', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.models));
		add('Колір', faker.helpers.arrayElement(VARIANT_OPTIONS.colors));
		add('Вага', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.weightsKg));
		add('Розмір', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.sizesMm));

		// Category-specific fields (also used in filters).
		if (category === 'Smartphones' || category === 'Tablets') {
			add('Памʼять', faker.helpers.arrayElement(VARIANT_OPTIONS.storage));
			add('Батарея', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.batteryMah));
		}

		if (category === 'Laptops & PCs') {
			add('ОЗП', faker.helpers.arrayElement(VARIANT_OPTIONS.ram));
			add('Памʼять', faker.helpers.arrayElement(VARIANT_OPTIONS.storage));
			add('Батарея', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.batteryMah));
		}

		if (category === 'TVs') {
			add('Діагональ', faker.helpers.arrayElement(VARIANT_OPTIONS.diagonal));
			add('Частота', faker.helpers.arrayElement(VARIANT_OPTIONS.refresh));
		}

		if (category === 'Cameras') {
			add('Памʼять', faker.helpers.arrayElement(VARIANT_OPTIONS.storage));
		}

		return create;
	};

	const attributeSetTemplateByMainCategory: Record<string, { name: string; attributes: string[] }> =
		{
			Smartphones: {
				name: 'Smartphones — Specifications',
				attributes: ['Модель', 'Колір', 'Памʼять', 'Батарея', 'Вага', 'Розмір'],
			},
			Tablets: {
				name: 'Tablets — Specifications',
				attributes: ['Модель', 'Колір', 'Памʼять', 'Батарея', 'Вага', 'Розмір'],
			},
			'Laptops & PCs': {
				name: 'Laptops & PCs — Specifications',
				attributes: ['Модель', 'ОЗП', 'Памʼять', 'Батарея', 'Вага', 'Розмір'],
			},
			TVs: {
				name: 'TVs — Specifications',
				attributes: ['Модель', 'Діагональ', 'Частота', 'Колір', 'Вага', 'Розмір'],
			},
			Cameras: {
				name: 'Cameras — Specifications',
				attributes: ['Модель', 'Колір', 'Памʼять', 'Вага', 'Розмір'],
			},
			Audio: {
				name: 'Audio — Specifications',
				attributes: ['Модель', 'Колір', 'Вага', 'Розмір'],
			},
			Gaming: {
				name: 'Gaming — Specifications',
				attributes: ['Модель', 'Колір', 'Памʼять', 'Вага', 'Розмір'],
			},
			Accessories: {
				name: 'Accessories — Specifications',
				attributes: ['Модель', 'Колір', 'Розмір', 'Вага'],
			},
		};

	const ensureAttributeSetForCategory = async (
		categoryId: string,
		mainCategoryName: string
	) => {
		const template = attributeSetTemplateByMainCategory[mainCategoryName];
		if (!template) return;

		const attributeIds = template.attributes.map(getAttributeId);

		const attributeSet = await prisma.productAttributeSet.upsert({
			where: { categoryId },
			update: { name: template.name },
			create: { categoryId, name: template.name },
		});

		await prisma.productAttributeSetItem.deleteMany({
			where: {
				attributeSetId: attributeSet.id,
				attributeId: { notIn: attributeIds },
			},
		});

		await Promise.all(
			attributeIds.map((attributeId, sortOrder) =>
				prisma.productAttributeSetItem.upsert({
					where: { attributeSetId_attributeId: { attributeSetId: attributeSet.id, attributeId } },
					update: { sortOrder },
					create: { attributeSetId: attributeSet.id, attributeId, sortOrder },
				})
			)
		);
	};

	// Categories + Products
	for (const main of mainCategories) {
		const parentSlug = createSlug(main);
		const parentImage = getCategoryImage(main);
		const parent = await prisma.productCategory.upsert({
			where: { slug: parentSlug },
			update: { name: main, parentId: null, imageUrl: parentImage },
			create: { name: main, slug: parentSlug, parentId: null, imageUrl: parentImage },
		});

		const subs = subcategoriesMap[main] ?? [];
		for (const sub of subs) {
			const subSlug = createSlug(sub);
			const subImage = getSubcategoryImage(sub, subSlug);
			const subcategory = await prisma.productCategory.upsert({
				where: { slug: subSlug },
				update: { name: sub, parentId: parent.id, imageUrl: subImage },
				create: { name: sub, slug: subSlug, parentId: parent.id, imageUrl: subImage },
			});

			await ensureAttributeSetForCategory(subcategory.id, main);

			const count = faker.number.int({ min: 3, max: 5 });
			for (let i = 0; i < count; i++) {
				const name = faker.commerce.productName();
				const price = new Prisma.Decimal(
					faker.number.float({ min: 100, max: 1500, fractionDigits: 2 })
				);
				const stock = faker.number.int({ min: 5, max: 50 });

				// Discount validation
				let discountPrice: Prisma.Decimal | null = null;
				if (faker.datatype.boolean()) {
					const discountValue = new Prisma.Decimal(faker.number.int({ min: 10, max: 100 }));
					if (price.gt(discountValue)) {
						discountPrice = price.sub(discountValue);
					}
				}

				// Safe unique slug
				const productSlug = createSlug(`${name}-${nanoid()}`);
				const fullSlug = `${parentSlug}/${subSlug}/${productSlug}`;
				const imageUrl = getSubcategoryImage(sub, productSlug);

				const pickedBrand = stablePick(brands, productSlug);
				const product = await prisma.product.create({
					data: {
						name,
						slug: productSlug,
						fullSlug,
						status: 'ACTIVE',
						categoryName: main,
						subcategoryName: sub,
						description: faker.commerce.productDescription(),
						imageUrl,
						basePrice: price,
						discountPrice,
						stock,
						inStock: stock > 0,
						averageRating: 0,
						reviewCount: 0,
						productCode: faker.string.numeric(6),
						brandId: pickedBrand.id,
						categoryId: subcategory.id,
						tags: [],
						attributes: {
							create: buildProductAttributeValueCreates(main),
						},
					},
				});

				const variantTemplates = buildVariantTemplates(main);
				for (const [index, variant] of variantTemplates.entries()) {
					const variantAttributes = Object.entries(variant.attributes)
						.map(([name, value]) => {
							const attr = attributeByName.get(name);
							if (!attr) return null;
							return { attributeId: attr.id, value: String(value) };
						})
						.filter(Boolean) as { attributeId: string; value: string }[];

					if (variantAttributes.length === 0) continue;

					await prisma.productVariant.create({
						data: {
							productId: product.id,
							sku: `${product.productCode}-${index + 1}`,
							price: price.add(new Prisma.Decimal(variant.priceDelta)),
							stock: faker.number.int({ min: 1, max: Math.max(2, Math.floor(stock / 2)) }),
							attributes: { create: variantAttributes },
						},
					});
				}

				allProducts.push(product);
			}
		}
	}

	// Backfill any existing categories/products with missing or unsupported images
	const categoriesNeedingImages = await prisma.productCategory.findMany({
		where: {},
		select: { id: true, name: true, slug: true, parentId: true, imageUrl: true },
	});

	for (const cat of categoriesNeedingImages) {
		if (needsImageReplacement(cat.imageUrl)) {
			const newImage = cat.parentId
				? getSubcategoryImage(cat.name, cat.slug)
				: getCategoryImage(cat.name);
			await prisma.productCategory.update({
				where: { id: cat.id },
				data: { imageUrl: newImage },
			});
		}
	}

	const productsNeedingImages = await prisma.product.findMany({
		where: {},
		select: { id: true, slug: true, categoryName: true, subcategoryName: true, imageUrl: true },
	});

	for (const product of productsNeedingImages) {
		if (needsImageReplacement(product.imageUrl)) {
			const seed = product.slug ?? product.id;
			const keyword =
				subcategoryImageKeywords[product.subcategoryName] ??
				categoryImageKeywords[product.categoryName] ??
				'tech-gadgets';

			await prisma.product.update({
				where: { id: product.id },
				data: {
					imageUrl: buildKeywordImage(keyword, 900, 900, seed),
				},
			});
		}
	}

	// Assign tags
	const pickProductsForTag = (tag: string, count: number) => {
		const inStock = allProducts.filter((p) => p.inStock);
		switch (tag) {
			case 'discount': {
				const discounted = inStock.filter((p) => p.discountPrice != null);
				return faker.helpers.shuffle(discounted.length ? discounted : inStock).slice(0, count);
			}
			case 'new': {
				const latest = inStock.slice(-Math.max(count, 12));
				return faker.helpers.shuffle(latest).slice(0, count);
			}
			default:
				return faker.helpers.shuffle(inStock).slice(0, count);
		}
	};

	const tagCounts: Record<string, number> = {
		popular: 10,
		new: 10,
		discount: 10,
		promotional: 10,
		viewed: 10,
	};

	for (const tag of TAGS) {
		const productsForTag = pickProductsForTag(tag, tagCounts[tag] ?? 8);
		for (const p of productsForTag) {
			await prisma.product.update({
				where: { id: p.id },
				data: { tags: { push: tag } },
			});
		}
	}

	// Promo banners for homepage Promo slider (admin-controlled via Banner)
	const seededPromoBanners = [
		{
			title: 'Laptop Deals Week',
			subtitle: 'Save on ultrabooks, gaming rigs, and accessories.',
			linkLabel: 'Shop laptops',
			linkUrl: '/products/search/?tag=discount',
			imageUrl: buildKeywordImage('laptop-deals', 1200, 700, 'promo-laptops'),
			placement: 'promo',
		},
		{
			title: 'New Arrivals',
			subtitle: 'Fresh drops across all categories.',
			linkLabel: 'Browse new',
			linkUrl: '/products/search/?tag=new',
			imageUrl: buildKeywordImage('new-tech', 1200, 700, 'promo-new'),
			placement: 'promo',
		},
		{
			title: 'Popular Right Now',
			subtitle: 'Top picks customers love.',
			linkLabel: 'View popular',
			linkUrl: '/products/search/?tag=popular',
			imageUrl: buildKeywordImage('popular-tech', 1200, 700, 'promo-popular'),
			placement: 'promo',
		},
	] as const;

	await prisma.banner.deleteMany({
		where: {
			placement: 'promo',
			title: { in: seededPromoBanners.map((b) => b.title) },
		},
	});

	await prisma.banner.createMany({
		data: seededPromoBanners.map((b) => ({
			title: b.title,
			subtitle: b.subtitle,
			linkLabel: b.linkLabel,
			linkUrl: b.linkUrl,
			imageUrl: b.imageUrl,
			placement: b.placement,
			isActive: true,
			startsAt: null,
			endsAt: null,
		})),
	});

	const seedUserId = 'user-roman-951';

	// Clean up previous seed data for the seed user to avoid FK conflicts
	await prisma.orderItem.deleteMany({ where: { order: { userId: seedUserId } } });
	await prisma.order.deleteMany({ where: { userId: seedUserId } });
	await prisma.review.deleteMany({ where: { userId: seedUserId } });
	await prisma.wishlist.deleteMany({ where: { userId: seedUserId } });
	await prisma.cartItem.deleteMany({ where: { cart: { userId: seedUserId } } });
	await prisma.cart.deleteMany({ where: { userId: seedUserId } });
	await prisma.session.deleteMany({ where: { userId: seedUserId } });
	await prisma.account.deleteMany({ where: { userId: seedUserId } });
	await prisma.user.deleteMany({ where: { id: seedUserId } });

	const roman = await prisma.user.create({
		data: {
			id: seedUserId,
			email: 'roman@mail.com',
			name: 'Roman',
			emailVerified: true,
			phoneNumber: '+380951234567',
			phoneNumberVerified: true,
			image: 'https://picsum.photos/seed/roman-user/160/160',
		},
	});

	const reviewedProducts = faker.helpers.arrayElements(allProducts, 10);

	for (const product of reviewedProducts) {
		const rating = faker.number.int({ min: 3, max: 5 });

		await prisma.review.create({
			data: {
				userId: roman.id,
				productId: product.id,
				rating,
				comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
				advantages: faker.lorem.words(faker.number.int({ min: 2, max: 5 })),
				disadvantages: faker.lorem.words(faker.number.int({ min: 2, max: 5 })),
				createdAt: faker.date.recent({ days: 30 }),
			},
		});

		// Update product rating + count properly
		const reviews = await prisma.review.findMany({
			where: { productId: product.id },
			select: { rating: true },
		});

		const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

		await prisma.product.update({
			where: { id: product.id },
			data: {
				averageRating: avgRating,
				reviewCount: reviews.length,
			},
		});
	}

	// Orders
	const orderedProducts = faker.helpers.arrayElements(allProducts, 2);
	const total = orderedProducts.reduce<Prisma.Decimal>(
		(sum, p) => sum.add(p.basePrice),
		new Prisma.Decimal(0)
	);

	await prisma.order.create({
		data: {
			userId: roman.id,
			total,
			status: OrderStatus.PAID,
			items: {
				create: orderedProducts.map((p) => ({
					productId: p.id,
					quantity: 1,
					price: p.basePrice,
					unitPrice: p.basePrice,
				})),
			},
		},
	});

	// Content pages (editable via AdminJS)
	const now = new Date();
	await prisma.page.upsert({
		where: { slug: 'privacy-policy' },
		update: {
			title: 'Privacy Policy',
			status: 'PUBLISHED',
			type: 'PAGE',
			excerpt: 'How we collect, use, and protect personal data.',
			content:
				'This is a starter Privacy Policy template. Replace it with your real policy and legal advice.\n\nWe process your personal data to fulfill orders, provide customer support, prevent fraud, and comply with legal obligations.\n\nContact: support@example.com',
			publishedAt: now,
		},
		create: {
			title: 'Privacy Policy',
			slug: 'privacy-policy',
			status: 'PUBLISHED',
			type: 'PAGE',
			excerpt: 'How we collect, use, and protect personal data.',
			content:
				'This is a starter Privacy Policy template. Replace it with your real policy and legal advice.\n\nWe process your personal data to fulfill orders, provide customer support, prevent fraud, and comply with legal obligations.\n\nContact: support@example.com',
			publishedAt: now,
		},
	});

	await prisma.page.upsert({
		where: { slug: 'cookie-policy' },
		update: {
			title: 'Cookie Policy',
			status: 'PUBLISHED',
			type: 'PAGE',
			excerpt: 'What cookies we use and why.',
			content:
				'This is a starter Cookie Policy template. Replace it with your real policy.\n\nWe use essential cookies to keep the site working (e.g. login and cart). Optional cookies (analytics/marketing) should only be enabled after consent where required by law.',
			publishedAt: now,
		},
		create: {
			title: 'Cookie Policy',
			slug: 'cookie-policy',
			status: 'PUBLISHED',
			type: 'PAGE',
			excerpt: 'What cookies we use and why.',
			content:
				'This is a starter Cookie Policy template. Replace it with your real policy.\n\nWe use essential cookies to keep the site working (e.g. login and cart). Optional cookies (analytics/marketing) should only be enabled after consent where required by law.',
			publishedAt: now,
		},
	});

	// Storefront forms (editable via AdminJS)
	const storefrontForms = [
		{
			key: 'checkout-terms',
			placement: StorefrontFormPlacement.CHECKOUT,
			title: 'Terms acceptance',
			description: 'Required for checkout',
			enabled: true,
			required: true,
			checkboxLabel: 'I agree to the Terms of Service',
			linkLabel: 'Read terms',
			linkHref: '/terms',
			sortOrder: 10,
		},
		{
			key: 'checkout-privacy',
			placement: StorefrontFormPlacement.CHECKOUT,
			title: 'Privacy policy acknowledgement',
			description: 'Required for checkout',
			enabled: true,
			required: true,
			checkboxLabel: 'I have read the Privacy Policy',
			linkLabel: 'Read privacy policy',
			linkHref: '/privacy-policy',
			sortOrder: 20,
		},
		{
			key: 'checkout-marketing',
			placement: StorefrontFormPlacement.CHECKOUT,
			title: 'Marketing emails',
			description: 'Optional',
			enabled: false,
			required: false,
			checkboxLabel: 'I want to receive marketing emails and special offers',
			sortOrder: 30,
		},
		{
			key: 'cookie-consent-banner',
			placement: StorefrontFormPlacement.COOKIE_BANNER,
			title: 'Cookies',
			description: 'Cookie preferences',
			body:
				'We use cookies to make the site work. Optional cookies (analytics/marketing) are only used with consent where required.\n\nYou can change your choice later by clearing cookies in your browser.',
			enabled: false,
			required: false,
			acceptLabel: 'Accept all',
			declineLabel: 'Essential only',
			linkLabel: 'Cookie Policy',
			linkHref: '/cookie-policy',
			sortOrder: 10,
		},
	] as const;

	for (const form of storefrontForms) {
		await prisma.storefrontForm.upsert({
			where: { key: form.key },
			update: form,
			create: form,
		});
	}

	console.log('✅ Seeding completed.');
}

main()
	.catch((e) => {
		console.error('❌ Seeding error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
