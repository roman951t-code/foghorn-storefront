import { PrismaClient, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

function createSlug(text: string) {
	return slugify(text, { lower: true, strict: true });
}

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

async function main() {
	console.log('🌱 Seeding started...');

	const brand = await prisma.brand.upsert({
		where: { slug: 'techbrand' },
		update: {},
		create: {
			name: 'TechBrand',
			slug: 'techbrand',
			logoUrl: faker.image.avatar(),
		},
	});

	const attributeNames = [
		{ name: 'Weight', unit: 'g' },
		{ name: 'Size', unit: 'mm' },
		{ name: 'Model', unit: '' },
		{ name: 'Color', unit: '' },
		{ name: 'Battery', unit: 'mAh' },
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

	const allProducts = [];

	for (const main of mainCategories) {
		const parentSlug = createSlug(main);
		const parent = await prisma.productCategory.upsert({
			where: { slug: parentSlug },
			update: {},
			create: { name: main, slug: parentSlug },
		});

		for (const sub of subcategoriesMap[main]) {
			const subSlug = createSlug(`${main}-${sub}`);
			const subcategory = await prisma.productCategory.upsert({
				where: { slug: subSlug },
				update: {},
				create: { name: sub, slug: subSlug, parentId: parent.id },
			});

			const count = faker.number.int({ min: 2, max: 3 });
			for (let i = 0; i < count; i++) {
				const name = faker.commerce.productName();
				const price = new Decimal(faker.number.float({ min: 100, max: 1500, fractionDigits: 2 }));
				const stock = faker.number.int({ min: 5, max: 50 });

				const hasDiscount = faker.datatype.boolean();
				const discountPrice = hasDiscount
					? price.sub(new Decimal(faker.number.int({ min: 10, max: 100 })))
					: null;

				const product = await prisma.product.create({
					data: {
						name,
						slug: createSlug(`${name}-${Date.now()}`),
						description: faker.commerce.productDescription(),
						imageUrl: faker.image.urlLoremFlickr({ category: 'technology' }),
						basePrice: price,
						discountPrice,
						stock,
						averageRating: 4.8,
						reviewCount: 3,
						productCode: faker.string.numeric(6),
						inStock: stock > 10 && faker.datatype.boolean(),
						brandId: brand.id,
						categoryId: subcategory.id,
					},
				});

				for (const attr of attributes) {
					await prisma.productAttributeValue.create({
						data: {
							productId: product.id,
							attributeId: attr.id,
							value:
								faker.commerce.productAdjective() + ' ' + faker.number.int({ min: 100, max: 9999 }),
						},
					});
				}

				allProducts.push(product);
			}
		}
	}

	const roman = await prisma.user.upsert({
		where: { email: 'roman951t@gmail.com' },
		update: {},
		create: {
			id: 'user-roman-951',
			email: 'roman951t@gmail.com',
			name: 'Roman',
			emailVerified: true,
			phoneNumber: '+380951234567',
			phoneNumberVerified: true,
			image: faker.image.avatar(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	const wishlistProducts = faker.helpers.arrayElements(allProducts, 5);
	await prisma.wishlist.createMany({
		data: wishlistProducts.map((p) => ({
			userId: roman.id,
			productId: p.id,
			createdAt: new Date(),
		})),
		skipDuplicates: true,
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
				createdAt: faker.date.recent({ days: 30 }),
			},
		});

		await prisma.product.update({
			where: { id: product.id },
			data: {
				averageRating: rating,
				reviewCount: 1,
			},
		});
	}

	const orderedProducts = faker.helpers.arrayElements(allProducts, 2);
	const total = orderedProducts.reduce((sum, p) => sum.add(p.basePrice), new Decimal(0));

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
