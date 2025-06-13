import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// Seed categories
	const smartphoneCategory = await prisma.productCategory.upsert({
		where: { slug: 'smartphones' },
		update: {},
		create: {
			name: 'Smartphones',
			slug: 'smartphones',
		},
	});

	const laptopCategory = await prisma.productCategory.upsert({
		where: { slug: 'laptops' },
		update: {},
		create: {
			name: 'Laptops',
			slug: 'laptops',
		},
	});

	// Seed products
	const product1 = await prisma.product.upsert({
		where: { slug: 'iphone-15-pro-max' },
		update: {},
		create: {
			name: 'iPhone 15 Pro Max',
			description: 'Latest iPhone with amazing camera and performance.',
			price: 1199.99,
			stock: 50,
			slug: 'iphone-15-pro-max',
			imageUrl: 'https://example.com/iphone.jpg',
			categoryId: smartphoneCategory.id,
		},
	});

	const product2 = await prisma.product.upsert({
		where: { slug: 'macbook-air-m3' },
		update: {},
		create: {
			name: 'MacBook Air M3',
			description: 'Lightweight and powerful Apple laptop.',
			price: 1499.99,
			stock: 30,
			slug: 'macbook-air-m3',
			imageUrl: 'https://example.com/macbook.jpg',
			categoryId: laptopCategory.id,
		},
	});

	const existingUser = await prisma.user.findFirst();

	if (existingUser) {
		await prisma.order.create({
			data: {
				userId: existingUser.id,
				total: product1.price.add(product2.price),
				status: 'PENDING',
				items: {
					create: [
						{
							productId: product1.id,
							quantity: 1,
							price: product1.price,
							unitPrice: product1.price,
						},
						{
							productId: product2.id,
							quantity: 1,
							price: product2.price,
							unitPrice: product2.price,
						},
					],
				},
			},
		});
		console.log('Order seeded successfully');
	} else {
		console.warn('⚠️  No user found. Skipping order seeding.');
	}

	console.log('Seeding finished!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
