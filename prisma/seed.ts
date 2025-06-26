import { PrismaClient } from '@prisma/client';
import { add } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
	// === 1. Create User ===
	const user = await prisma.user.upsert({
		where: { email: 'john.doe@example.com' },
		update: {},
		create: {
			email: 'john.doe@example.com',
			name: 'John Doe',
			hashedPassword: '123',
			image: 'https://randomuser.me/api/portraits/men/1.jpg',
			phone: '+1234567890',
			emailVerified: new Date(),
		},
	});

	// === 2. Create Auth Account ===
	await prisma.account.upsert({
		where: {
			provider_providerAccountId: {
				provider: 'google',
				providerAccountId: 'google-oauth2|1234567890',
			},
		},
		update: {},
		create: {
			provider: 'google',
			providerAccountId: 'google-oauth2|1234567890',
			type: 'oauth',
			access_token: 'fakeaccesstoken',
			refresh_token: 'fakerefreshtoken',
			userId: user.id,
		},
	});

	// === 5. Product Categories ===
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

	// === 6. Products ===
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

	// === 7. Order for the user ===
	await prisma.order.create({
		data: {
			userId: user.id,
			total: product1.price.add(product2.price),
			status: 'PAID',
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

	console.log('🌱 Seeding finished successfully.');
}

main()
	.catch((e) => {
		console.error('❌ Seeding error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
