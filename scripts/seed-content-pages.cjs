const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const pages = [
	{
		slug: 'about-us',
		title: 'Про нас',
		content: `Ми — інтернет-магазин, який прагне надати найкращий сервіс та якісні товари для наших клієнтів. Наша команда щодня працює над тим, щоб ви отримували своє замовлення вчасно та були задоволені покупкою.

  Ми віримо в чесність, надійність та швидку підтримку.`,
	},
	{
		slug: 'faq',
		title: 'Часті питання',
		content: JSON.stringify(
			[
				{
					question: 'Що таке повернення товару?',
					answer: 'Ми приймаємо повернення протягом 30 днів після покупки.',
				},
				{
					question: 'Чи доступна міжнародна доставка?',
					answer: 'Так, ми доставляємо товари у більшість країн світу.',
				},
			],
			null,
			2
		),
	},
	{
		slug: 'guarantee',
		title: 'Гарантії',
		content: `Ми надаємо гарантію на всі товари відповідно до законодавства України. У випадку виявлення виробничого браку, ви маєте право на безкоштовний ремонт або заміну товару.

  Зверніться до нас із підтвердженням покупки та описом проблеми, і ми вирішимо питання якомога швидше.`,
	},
	{
		slug: 'public-offer',
		title: 'Публічна оферта',
		content: `Цей документ є публічною офертою, що визначає умови покупки товарів через наш інтернет-магазин. Кожен покупець, оформлюючи замовлення, погоджується з умовами оферти.

  Ми залишаємо за собою право змінювати умови цієї оферти без попереднього повідомлення.`,
	},
	{
		slug: 'return-refund',
		title: 'Обмін/повернення',
		content: `Ви можете обміняти або повернути товар протягом 14 днів з моменту покупки за умови, що товар не був у використанні та збережений товарний вигляд.

  Щоб здійснити обмін або повернення, зв’яжіться з нашою службою підтримки, і ми допоможемо вам пройти всі етапи процесу.`,
	},
	{
		slug: 'shipping-terms',
		title: 'Умови доставки',
		content: `Ми пропонуємо доставку по всій території України через популярні служби доставки (Нова Пошта, Укрпошта та інші).

  Вартість і строки доставки залежать від вашого регіону та вибраного способу доставки. Зазвичай доставка займає 1–3 робочі дні.`,
	},
	{
		slug: 'terms',
		title: 'Умови та положення',
		content: `Ми пропонуємо доставку по всій території України через популярні служби доставки (Нова Пошта, Укрпошта та інші).

  Вартість і строки доставки залежать від вашого регіону та вибраного способу доставки. Зазвичай доставка займає 1–3 робочі дні.`,
	},
];

const buildExcerpt = (content) => {
	const firstLine = content
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.length > 0);
	if (!firstLine) return null;
	return firstLine.length > 160 ? `${firstLine.slice(0, 157)}...` : firstLine;
};

async function main() {
	console.log('🌱 Seeding content pages...');
	const now = new Date();

	for (const page of pages) {
		const existing = await prisma.page.findUnique({
			where: { slug: page.slug },
			select: { id: true },
		});
		if (existing) {
			console.log(`↪︎ Skipping ${page.slug} (already exists)`);
			continue;
		}

		const excerpt = buildExcerpt(page.content);
		await prisma.page.create({
			data: {
				title: page.title,
				slug: page.slug,
				type: 'PAGE',
				status: 'PUBLISHED',
				content: page.content,
				excerpt,
				metaTitle: page.title,
				metaDescription: excerpt,
				publishedAt: now,
			},
		});

		console.log(`✅ Created ${page.slug}`);
	}
}

main()
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
