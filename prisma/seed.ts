import { PrismaClient, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();
type SeedProduct = { id: string; inStock: boolean; basePrice: Decimal };

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
	'Laptops & PCs': ['Ultrabooks', 'Gaming Laptops', 'Desktops'],
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
	Ultrabooks: 'ultrabook',
	'Gaming Laptops': 'gaming-laptop',
	Desktops: 'desktop-computer',
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
		{ name: 'Вага', unit: 'г' },
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

	const productAttributes = productAttributeNames
		.map((attr) => attributeByName.get(attr.name))
		.filter(Boolean) as { id: string; name: string; unit: string | null }[];

	const TAGS = ['popular', 'new', 'discount', 'promotional', 'viewed'];
	const allProducts: SeedProduct[] = [];

	// Categories + Products
	for (const main of mainCategories) {
		const parentSlug = createSlug(main);
		const parentImage = getCategoryImage(main);
		const parent = await prisma.productCategory.upsert({
			where: { slug: parentSlug },
			update: { imageUrl: parentImage },
			create: { name: main, slug: parentSlug, imageUrl: parentImage },
		});

		for (const sub of subcategoriesMap[main]) {
			const subSlug = createSlug(sub);
			const subImage = getSubcategoryImage(sub, subSlug);
			const subcategory = await prisma.productCategory.upsert({
				where: { slug: subSlug },
				update: { parentId: parent.id, imageUrl: subImage },
				create: { name: sub, slug: subSlug, parentId: parent.id, imageUrl: subImage },
			});

			const count = faker.number.int({ min: 3, max: 5 });
			for (let i = 0; i < count; i++) {
				const name = faker.commerce.productName();
				const price = new Decimal(faker.number.float({ min: 100, max: 1500, fractionDigits: 2 }));
				const stock = faker.number.int({ min: 5, max: 50 });

				// Discount validation
				let discountPrice: Decimal | null = null;
				if (faker.datatype.boolean()) {
					const discountValue = new Decimal(faker.number.int({ min: 10, max: 100 }));
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
							create: productAttributes.map((attr) => ({
								attributeId: attr.id,
								value:
									faker.commerce.productAdjective() +
									' ' +
									faker.number.int({ min: 100, max: 9999 }),
							})),
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
							price: price.add(new Decimal(variant.priceDelta)),
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
	for (const tag of TAGS) {
		const inStockProducts = allProducts.filter((p) => p.inStock);

		// Ensure at least 6 in stock
		while (inStockProducts.length < 6) {
			const randomProduct = faker.helpers.arrayElement(allProducts);
			if (!randomProduct.inStock) {
				await prisma.product.update({
					where: { id: randomProduct.id },
					data: {
						inStock: true,
						stock: faker.number.int({ min: 15, max: 50 }),
					},
				});
				inStockProducts.push({ ...randomProduct, inStock: true });
			}
		}

		const productsForTag = faker.helpers.shuffle(inStockProducts).slice(0, 6);
		for (const p of productsForTag) {
			await prisma.product.update({
				where: { id: p.id },
				data: { tags: { push: tag } },
			});
		}
	}

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
	const total = orderedProducts.reduce<Decimal>((sum, p) => sum.add(p.basePrice), new Decimal(0));

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
