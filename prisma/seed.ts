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
	'Phones',
	'Tablets',
	'Laptops',
	'Accessories',
	'Smartwatches',
	'Audio',
	'Gaming',
	'Monitors',
];

const subcategoriesMap: Record<string, string[]> = {
	Phones: ['Smartphones', 'Feature Phones'],
	Tablets: ['Android Tablets', 'iPads'],
	Laptops: ['Ultrabooks', 'Gaming Laptops'],
	Accessories: ['Chargers', 'Cables'],
	Smartwatches: ['Fitness Trackers', 'Wear OS Watches'],
	Audio: ['Headphones', 'Speakers'],
	Gaming: ['Consoles', 'Controllers'],
	Monitors: ['4K Monitors', 'Gaming Monitors'],
};

const categoryImageKeywords: Record<string, string> = {
	Phones: 'smartphone',
	Tablets: 'tablet',
	Laptops: 'laptop',
	Accessories: 'tech-accessories',
	Smartwatches: 'smartwatch',
	Audio: 'headphones',
	Gaming: 'game-console',
	Monitors: 'computer-monitor',
};

const subcategoryImageKeywords: Record<string, string> = {
	Smartphones: 'smartphone',
	'Feature Phones': 'basic-phone',
	'Android Tablets': 'android-tablet',
	iPads: 'ipad-tablet',
	Ultrabooks: 'ultrabook',
	'Gaming Laptops': 'gaming-laptop',
	Chargers: 'device-charger',
	Cables: 'charging-cable',
	'Fitness Trackers': 'fitness-tracker',
	'Wear OS Watches': 'smartwatch',
	Headphones: 'headphones',
	Speakers: 'bluetooth-speaker',
	Consoles: 'game-console',
	Controllers: 'game-controller',
	'4K Monitors': '4k-monitor',
	'Gaming Monitors': 'gaming-monitor',
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

	// Brand
	const brand = await prisma.brand.upsert({
		where: { slug: 'techbrand' },
		update: {},
		create: {
			name: 'TechBrand',
			slug: 'techbrand',
			logoUrl: 'https://picsum.photos/seed/techbrand-logo/160/160',
		},
	});

	// Attributes
	const attributeNames = [
		{ name: 'Вага', unit: 'г' },
		{ name: 'Розмір', unit: 'мм' },
		{ name: 'Модель', unit: '' },
		{ name: 'Колір', unit: '' },
		{ name: 'Батарея', unit: 'мА·г' },
	];

	const attributes = await Promise.all(
		attributeNames.map((attr) =>
			prisma.productAttribute.upsert({
				where: { name: attr.name },
				update: {},
				create: { name: attr.name, unit: attr.unit },
			})
		)
	);

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
						brandId: brand.id,
						categoryId: subcategory.id,
						tags: [],
						attributes: {
							create: attributes.map((attr) => ({
								attributeId: attr.id,
								value:
									faker.commerce.productAdjective() +
									' ' +
									faker.number.int({ min: 100, max: 9999 }),
							})),
						},
					},
				});

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
