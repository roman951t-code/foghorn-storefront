import { Prisma, PrismaClient, OrderStatus, StorefrontFormPlacement } from '@prisma/client';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const DEFAULT_LOCALE = 'uk';
const SECONDARY_LOCALE = 'en';
const TRANSLATION_LOCALES = [DEFAULT_LOCALE, SECONDARY_LOCALE] as const;
type SupportedLocale = (typeof TRANSLATION_LOCALES)[number];
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
const usedProductCodes = new Set<string>();
const isSeedToggleEnabled = (rawValue: string | undefined, defaultValue: string) =>
	!['0', 'false', 'no', 'off'].includes((rawValue ?? defaultValue).trim().toLowerCase());
const SHOULD_GENERATE_CATEGORIES = isSeedToggleEnabled(process.env.SEED_GENERATE_CATEGORIES, 'true');
const SHOULD_GENERATE_PRODUCTS = isSeedToggleEnabled(process.env.SEED_GENERATE_PRODUCTS, 'true');
const SHOULD_GENERATE_SEED_PRODUCTS = SHOULD_GENERATE_CATEGORIES && SHOULD_GENERATE_PRODUCTS;
const SEED_MAIN_CATEGORY_COUNT = 9;
const SEED_SUBCATEGORY_MIN = 1;
const SEED_SUBCATEGORY_MAX = 3;
const SEED_PRODUCTS_PER_SUBCATEGORY_MIN = 1;
const SEED_PRODUCTS_PER_SUBCATEGORY_MAX = 3;

const generateUniqueProductCode = () => {
	let attempts = 0;
	while (attempts < 1000) {
		const candidate = faker.string.numeric(8);
		if (!usedProductCodes.has(candidate)) {
			usedProductCodes.add(candidate);
			return candidate;
		}
		attempts += 1;
	}
	throw new Error('Failed to generate a unique productCode during seeding.');
};

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
	'Wearables',
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
	Wearables: ['Smartwatches', 'Fitness Bands'],
};
const SEEDED_MAIN_CATEGORY_SLUGS = mainCategories.map((name) => createSlug(name));
const SEEDED_SUBCATEGORY_SLUGS = Array.from(
	new Set(Object.values(subcategoriesMap).flat().map((name) => createSlug(name)))
);

const mainCategoryUkMap: Record<string, string> = {
	Smartphones: 'Смартфони',
	Tablets: 'Планшети',
	'Laptops & PCs': 'Ноутбуки та ПК',
	TVs: 'Телевізори',
	Cameras: 'Камери',
	Audio: 'Аудіо',
	Gaming: 'Геймінг',
	Accessories: 'Аксесуари',
	Wearables: 'Носимі пристрої',
};

const subcategoryUkMap: Record<string, string> = {
	'Android Phones': 'Смартфони Android',
	iPhones: 'iPhone',
	'Android Tablets': 'Планшети Android',
	iPads: 'iPad',
	Laptops: 'Ноутбуки',
	Ultrabooks: 'Ультрабуки',
	'Gaming Laptops': 'Ігрові ноутбуки',
	Desktops: 'Настільні ПК',
	Monitors: 'Монітори',
	'4K TVs': 'Телевізори 4K',
	'Smart TVs': 'Смарт-телевізори',
	'Mirrorless Cameras': 'Бездзеркальні камери',
	'Action Cameras': 'Екшн-камери',
	Headphones: 'Навушники',
	Speakers: 'Колонки',
	Soundbars: 'Саундбари',
	Consoles: 'Консолі',
	Controllers: 'Контролери',
	'VR Headsets': 'VR-гарнітури',
	Chargers: 'Зарядні пристрої',
	Cables: 'Кабелі',
	Cases: 'Чохли',
	Smartwatches: 'Смарт-годинники',
	'Fitness Bands': 'Фітнес-браслети',
};

const fallbackProductModels = [
	'Horizon Pro',
	'Nova Air',
	'Pulse Max',
	'Vertex Go',
	'Summit Plus',
	'Orbit Ultra',
];

const productModelsBySubcategory: Record<string, string[]> = {
	'Android Phones': ['Nova Edge', 'Pulse Lite', 'Horizon Pro', 'Vertex Max'],
	iPhones: ['Apex One', 'Apex Plus', 'Apex Pro', 'Apex Max'],
	'Android Tablets': ['Tab Vision', 'Tab Air', 'Tab Studio', 'Tab Plus'],
	iPads: ['Pad One', 'Pad Air', 'Pad Pro', 'Pad Studio'],
	Laptops: ['Notebook Core', 'Notebook Pro', 'Notebook Air', 'Notebook Studio'],
	Ultrabooks: ['Feather Air', 'Feather Pro', 'Feather Max', 'Feather Studio'],
	'Gaming Laptops': ['Predator X', 'Legion Core', 'Nitro Pulse', 'Vortex Pro'],
	Desktops: ['Tower Core', 'Tower Studio', 'Tower Pro', 'Tower Max'],
	Monitors: ['Vision Display', 'Clarity View', 'Focus Panel', 'Spectrum Screen'],
	'4K TVs': ['Vision Cinema', 'Ultra Theater', 'Crystal View', 'Cinema Max'],
	'Smart TVs': ['Smart HomeView', 'Smart Stream', 'Smart Horizon', 'Smart Vision'],
	'Mirrorless Cameras': ['Lumina Mirrorless', 'Focus Mirrorless', 'Optic Pro', 'Frame X'],
	'Action Cameras': ['Adventure Cam', 'Trail Cam', 'Motion Cam', 'Summit Cam'],
	Headphones: ['Sound Wave', 'Quiet Studio', 'Bass Flow', 'Audio Pro'],
	Speakers: ['Pulse Speaker', 'Home Speaker', 'Arena Speaker', 'Echo Speaker'],
	Soundbars: ['Cinema Bar', 'Sound Bar Pro', 'Theater Bar', 'Studio Bar'],
	Consoles: ['Game Box', 'Play Hub', 'Arena Core', 'Next Play'],
	Controllers: ['Grip Controller', 'Pro Controller', 'Dual Controller', 'Arcade Controller'],
	'VR Headsets': ['VR Vision', 'VR Arena', 'VR Motion', 'VR Studio'],
	Chargers: ['Fast Charge', 'Power Adapter', 'Quick Charge', 'Travel Charger'],
	Cables: ['Charge Cable', 'Data Cable', 'Sync Cable', 'Flex Cable'],
	Cases: ['Slim Case', 'Protect Case', 'Armor Case', 'Clear Case'],
	Smartwatches: ['Watch Active', 'Watch Pro', 'Watch Sport', 'Watch Classic'],
	'Fitness Bands': ['Band Active', 'Band Pulse', 'Band Move', 'Band Fit'],
};

const productHighlightsEn = [
	'balanced performance and battery life',
	'a sharp display and dependable connectivity',
	'stable everyday speed for work and entertainment',
];

const productHighlightsUk = [
	'збалансовану продуктивність і автономність',
	'чіткий екран та стабільне підключення',
	'комфортну швидкодію для роботи й розваг',
];

const productUseCasesEn = [
	'great for remote work, streaming, and daily communication',
	'suited for study, office tasks, and media consumption',
	'designed for everyday tasks with smooth multitasking',
];

const productUseCasesUk = [
	'підходить для віддаленої роботи, стримінгу та щоденного спілкування',
	'добре працює для навчання, офісних задач і медіаконтенту',
	'створений для щоденних сценаріїв із плавною багатозадачністю',
];

const categoryImageKeywords: Record<string, string> = {
	Smartphones: 'smartphone',
	Tablets: 'tablet',
	'Laptops & PCs': 'laptop',
	TVs: 'television',
	Cameras: 'camera',
	Audio: 'headphones',
	Gaming: 'game-console',
	Accessories: 'tech-accessories',
	Wearables: 'smart-watch',
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
	Smartwatches: 'smart-watch',
	'Fitness Bands': 'fitness-band',
};

function stablePick<T>(items: T[], seed: string) {
	const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return items[hash % items.length];
}

function buildKeywordImage(keyword: string, width: number, height: number, seed: string) {
	const normalizedKeyword = encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'));
	return `https://picsum.photos/seed/${normalizedKeyword}-${seed}/${width}/${height}`;
}

const updatePicsumVariantPath = (url: URL, variantIndex: number) => {
	const segments = url.pathname.split('/').filter(Boolean);
	const seedIndex = segments.findIndex((segment) => segment === 'seed');
	if (seedIndex !== -1 && segments.length >= seedIndex + 4) {
		const baseSeed = segments[seedIndex + 1] ?? 'product';
		segments[seedIndex + 1] = `${baseSeed}-${variantIndex}`;
		segments[seedIndex + 2] = '900';
		segments[seedIndex + 3] = '900';
		url.pathname = '/' + segments.join('/');
		url.search = '';
		return;
	}
	url.searchParams.set('variant', String(variantIndex));
};

const updateLoremFlickrVariantPath = (url: URL, variantIndex: number) => {
	const segments = url.pathname.split('/').filter(Boolean);
	if (segments.length >= 2 && /^\d+$/.test(segments[0]) && /^\d+$/.test(segments[1])) {
		segments[0] = '900';
		segments[1] = '900';
		url.pathname = '/' + segments.join('/');
	}
	url.searchParams.set('lock', String(variantIndex));
};

const toVariantImageUrl = (primaryUrl: string, variantIndex: number) => {
	try {
		const parsed = new URL(primaryUrl);
		if (parsed.hostname.includes('picsum.photos')) {
			updatePicsumVariantPath(parsed, variantIndex);
		} else if (parsed.hostname.includes('loremflickr.com')) {
			updateLoremFlickrVariantPath(parsed, variantIndex);
		} else {
			parsed.searchParams.set('variant', String(variantIndex));
		}
		return parsed.toString();
	} catch {
		const separator = primaryUrl.includes('?') ? '&' : '?';
		return `${primaryUrl}${separator}variant=${variantIndex}`;
	}
};

const buildSeedProductGallery = (primaryUrl: string, extraImages = 3) => {
	const normalizedPrimary = primaryUrl.trim();
	if (!normalizedPrimary) return [];
	const urls: string[] = [normalizedPrimary];
	for (let i = 1; i <= extraImages; i += 1) {
		const variantUrl = toVariantImageUrl(normalizedPrimary, i);
		if (!urls.includes(variantUrl)) urls.push(variantUrl);
	}
	return urls;
};

const getCategoryImage = (name: string) => {
	const keyword = categoryImageKeywords[name] ?? subcategoryImageKeywords[name] ?? 'tech-gadgets';
	const seed = createSlug(name);
	return buildKeywordImage(keyword, 900, 900, seed) || stablePick(fallbackCategoryImages, seed);
};

const getSubcategoryImage = (sub: string, seed: string) => {
	const keyword = subcategoryImageKeywords[sub] ?? categoryImageKeywords[sub] ?? 'tech-gadgets';
	return buildKeywordImage(keyword, 900, 900, seed) || stablePick(fallbackProductImages, seed);
};

const buildSemanticProductName = (brandName: string, subcategoryName: string, seed: string) => {
	const models = productModelsBySubcategory[subcategoryName] ?? fallbackProductModels;
	const model = stablePick(models, seed);
	return `${brandName} ${model}`;
};

const VARIANT_OPTIONS = {
	colors: ['Black', 'White', 'Blue', 'Green', 'Silver'],
	storage: ['128', '256', '512'],
	ram: ['8', '16', '32'],
	diagonal: ['27', '32', '55', '65'],
	refresh: ['60', '120', '144'],
};

const PRODUCT_ATTRIBUTE_OPTIONS = {
	models: ['AX-100', 'AX-200', 'AX-300', 'ZN-100', 'ZN-200', 'ZN-300', 'VT-100', 'VT-200'],
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
					addCombo({ Колір: color, Памʼять: size });
				}
			}
			break;
		case 'Laptops & PCs':
			for (const ramSize of ram) {
				for (const size of storage) {
					addCombo({ ОЗП: ramSize, Памʼять: size });
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
					addCombo({ Колір: color, Памʼять: size });
				}
			}
			break;
		case 'Audio':
		case 'Accessories':
		case 'Wearables':
			for (const color of colors) {
				addCombo({ Колір: color });
			}
			break;
		case 'Gaming':
			for (const size of storage) {
				addCombo({ Памʼять: size });
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

function getLocalizedCategoryName(name: string, locale: SupportedLocale) {
	if (locale === 'en') return name;
	return mainCategoryUkMap[name] ?? subcategoryUkMap[name] ?? name;
}

type LocalizedProductCopy = {
	name: string;
	description: string;
	metaTitle: string;
	metaDescription: string;
	categoryName: string;
	subcategoryName: string;
};

function buildLocalizedProductCopy(
	product: {
		id: string;
		name: string;
		slug: string;
		fullSlug: string;
		categoryName: string;
		subcategoryName: string;
		brand: {
			name: string;
		};
	},
	locale: SupportedLocale
): LocalizedProductCopy {
	const isUkrainian = locale === 'uk';
	const categoryName = getLocalizedCategoryName(product.categoryName, locale);
	const subcategoryName = getLocalizedCategoryName(product.subcategoryName, locale);
	const highlight = stablePick(
		isUkrainian ? productHighlightsUk : productHighlightsEn,
		product.fullSlug
	);
	const useCase = stablePick(isUkrainian ? productUseCasesUk : productUseCasesEn, product.id);
	const name = product.name.trim();
	const description = isUkrainian
		? `${name} — ${subcategoryName.toLowerCase()} від ${
				product.brand.name
		  }, що пропонує ${highlight}. Модель ${useCase}.`
		: `${name} is a ${product.subcategoryName.toLowerCase()} by ${
				product.brand.name
		  } that delivers ${highlight}. It is ${useCase}.`;
	const metaTitle = `${name} | ${categoryName} | Online Store`;
	const metaDescription = isUkrainian
		? `${name} від ${product.brand.name}: ${highlight}. Швидка доставка по Україні.`
		: `${name} by ${product.brand.name}: ${highlight}. Fast shipping across Ukraine.`;

	return {
		name,
		description,
		metaTitle,
		metaDescription,
		categoryName,
		subcategoryName,
	};
}

type LocalizedPageCopy = {
	title: string;
	excerpt: string | null;
	content: string | null;
	metaTitle: string | null;
	metaDescription: string | null;
};

const pageLocalizationBySlug: Record<string, Record<SupportedLocale, LocalizedPageCopy>> = {
	'privacy-policy': {
		en: {
			title: 'Privacy Policy',
			excerpt: 'How we collect, use, and protect personal data.',
			content:
				'This is a starter Privacy Policy template. Replace it with your real policy and legal advice.\n\nWe process personal data to fulfill orders, provide customer support, prevent fraud, and comply with legal obligations.\n\nContact: support@example.com',
			metaTitle: 'Privacy Policy | Online Store',
			metaDescription:
				'Learn how Online Store collects, uses, and protects personal data during shopping and support interactions.',
		},
		uk: {
			title: 'Політика конфіденційності',
			excerpt: 'Як ми збираємо, використовуємо та захищаємо персональні дані.',
			content:
				'Це стартовий шаблон Політики конфіденційності. Замініть його на вашу фактичну політику та юридично перевірений текст.\n\nМи обробляємо персональні дані для виконання замовлень, підтримки клієнтів, запобігання шахрайству та виконання вимог законодавства.\n\nКонтакт: support@example.com',
			metaTitle: 'Політика конфіденційності | Online Store',
			metaDescription:
				'Дізнайтеся, як Online Store збирає, використовує та захищає персональні дані під час покупок і звернень у підтримку.',
		},
	},
	'cookie-policy': {
		en: {
			title: 'Cookie Policy',
			excerpt: 'What cookies we use and why.',
			content:
				'This is a starter Cookie Policy template. Replace it with your real policy.\n\nWe use essential cookies to keep the site working (for example: login, cart, and security). Optional cookies (analytics/marketing) should be enabled only after consent where required by law.',
			metaTitle: 'Cookie Policy | Online Store',
			metaDescription:
				'Read which cookies Online Store uses, what they do, and how consent affects optional analytics and marketing cookies.',
		},
		uk: {
			title: 'Політика використання cookie',
			excerpt: 'Які cookie ми використовуємо та з якою метою.',
			content:
				'Це стартовий шаблон Політики cookie. Замініть його на вашу фактичну політику.\n\nМи використовуємо обовʼязкові cookie для роботи сайту (наприклад: вхід, кошик і безпека). Необовʼязкові cookie (аналітика/маркетинг) вмикаються лише після згоди, якщо це вимагає закон.',
			metaTitle: 'Політика cookie | Online Store',
			metaDescription:
				'Перегляньте, які cookie використовує Online Store, для чого вони потрібні та як згода впливає на необовʼязкові cookie.',
		},
	},
	'about-us': {
		en: {
			title: 'About Us',
			excerpt: 'Who we are and what service standards we follow.',
			content:
				'We are an online electronics store focused on reliable service and practical product selection.\n\nOur team works every day to deliver orders on time and provide fast, clear support before and after purchase.',
			metaTitle: 'About Us | Online Store',
			metaDescription:
				'Learn about Online Store values, customer service approach, and how we build a reliable shopping experience.',
		},
		uk: {
			title: 'Про нас',
			excerpt: 'Хто ми та яких стандартів сервісу дотримуємося.',
			content:
				'Ми — інтернет-магазин електроніки, що фокусується на надійному сервісі та практичному підборі товарів.\n\nНаша команда щодня працює, щоб ви отримували замовлення вчасно й мали швидку та зрозумілу підтримку до і після покупки.',
			metaTitle: 'Про нас | Online Store',
			metaDescription:
				'Дізнайтеся про цінності Online Store, підхід до сервісу клієнтів і принципи нашої роботи.',
		},
	},
	faq: {
		en: {
			title: 'FAQ',
			excerpt: 'Answers to the most common customer questions.',
			content: JSON.stringify(
				[
					{
						question: 'How long can I return a product after purchase?',
						answer: 'You can return eligible products within 30 days after purchase.',
					},
					{
						question: 'Do you provide international shipping?',
						answer: 'Yes, we ship internationally to most countries.',
					},
				],
				null,
				2
			),
			metaTitle: 'FAQ | Online Store',
			metaDescription:
				'Find quick answers about delivery, returns, payments, and other common Online Store questions.',
		},
		uk: {
			title: 'Часті питання',
			excerpt: 'Відповіді на найпоширеніші запитання клієнтів.',
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
			metaTitle: 'Часті питання | Online Store',
			metaDescription:
				'Перегляньте відповіді щодо доставки, повернення, оплати та інших поширених питань Online Store.',
		},
	},
	guarantee: {
		en: {
			title: 'Warranty',
			excerpt: 'Warranty terms and defect handling process.',
			content:
				'We provide warranty coverage for all products under applicable Ukrainian law.\n\nIf you detect a manufacturing defect, contact us with proof of purchase and issue details. We will help with repair or replacement as quickly as possible.',
			metaTitle: 'Warranty | Online Store',
			metaDescription:
				'Read Online Store warranty terms and what to do when a product has a manufacturing defect.',
		},
		uk: {
			title: 'Гарантії',
			excerpt: 'Умови гарантії та порядок дій у разі дефекту товару.',
			content:
				'Ми надаємо гарантію на всі товари відповідно до законодавства України.\n\nУ разі виявлення виробничого браку зверніться до нас із підтвердженням покупки та описом проблеми. Ми допоможемо з ремонтом або заміною у найкоротші строки.',
			metaTitle: 'Гарантії | Online Store',
			metaDescription:
				'Ознайомтеся з гарантійними умовами Online Store та алгоритмом дій при виявленні браку.',
		},
	},
	'public-offer': {
		en: {
			title: 'Public Offer',
			excerpt: 'Terms of purchase for orders placed in our online store.',
			content:
				'This document is a public offer that defines purchase conditions in our online store.\n\nBy placing an order, the customer accepts the offer terms. We reserve the right to update the offer text without prior notice.',
			metaTitle: 'Public Offer | Online Store',
			metaDescription:
				'Review the public offer terms that apply to purchases made at Online Store.',
		},
		uk: {
			title: 'Публічна оферта',
			excerpt: 'Умови купівлі товарів в інтернет-магазині.',
			content:
				'Цей документ є публічною офертою, що визначає умови покупки товарів через наш інтернет-магазин.\n\nОформлюючи замовлення, покупець погоджується з умовами оферти. Ми залишаємо за собою право змінювати текст оферти без попереднього повідомлення.',
			metaTitle: 'Публічна оферта | Online Store',
			metaDescription:
				'Ознайомтеся з умовами публічної оферти, що діють для покупок в Online Store.',
		},
	},
	'return-refund': {
		en: {
			title: 'Returns and Refunds',
			excerpt: 'How exchange and return requests are processed.',
			content:
				'You can exchange or return a product within 14 days after purchase if it has not been used and keeps its original condition.\n\nContact our support team to start the process, and we will guide you through each step.',
			metaTitle: 'Returns and Refunds | Online Store',
			metaDescription:
				'Learn Online Store return timelines, eligibility requirements, and refund workflow.',
		},
		uk: {
			title: 'Обмін/повернення',
			excerpt: 'Як відбувається обмін і повернення товару.',
			content:
				'Ви можете обміняти або повернути товар протягом 14 днів з моменту покупки за умови, що він не був у використанні та збережений товарний вигляд.\n\nЩоб розпочати процедуру, зверніться до служби підтримки, і ми допоможемо пройти всі етапи.',
			metaTitle: 'Обмін та повернення | Online Store',
			metaDescription: 'Дізнайтеся про строки, умови та порядок повернення коштів в Online Store.',
		},
	},
	'shipping-terms': {
		en: {
			title: 'Shipping Terms',
			excerpt: 'Delivery options, timelines, and shipping costs.',
			content:
				'We deliver across Ukraine through popular carriers such as Nova Poshta and Ukrposhta.\n\nShipping cost and delivery time depend on your region and selected method. Typical delivery window is 1-3 business days.',
			metaTitle: 'Shipping Terms | Online Store',
			metaDescription:
				'Check delivery methods, costs, and estimated shipping timelines for Online Store orders.',
		},
		uk: {
			title: 'Умови доставки',
			excerpt: 'Способи доставки, строки та вартість відправлень.',
			content:
				'Ми доставляємо по всій території України через популярні служби доставки, зокрема Нова Пошта та Укрпошта.\n\nВартість і строки залежать від регіону та обраного способу доставки. Зазвичай доставка триває 1-3 робочі дні.',
			metaTitle: 'Умови доставки | Online Store',
			metaDescription: 'Перегляньте способи, строки та вартість доставки замовлень Online Store.',
		},
	},
	terms: {
		en: {
			title: 'Terms and Conditions',
			excerpt: 'General terms for using the website and placing orders.',
			content:
				'These Terms and Conditions define the rules for using our website and placing orders.\n\nBy using the website, you agree to these terms, payment and delivery policies, and other publicly available store documents.',
			metaTitle: 'Terms and Conditions | Online Store',
			metaDescription:
				'Read the terms governing website usage, orders, and customer responsibilities at Online Store.',
		},
		uk: {
			title: 'Умови та положення',
			excerpt: 'Загальні правила користування сайтом і оформлення замовлень.',
			content:
				'Ці Умови та положення визначають правила користування сайтом і оформлення замовлень.\n\nКористуючись сайтом, ви погоджуєтеся з цими умовами, правилами оплати та доставки, а також іншими публічними документами магазину.',
			metaTitle: 'Умови та положення | Online Store',
			metaDescription:
				'Ознайомтеся з правилами використання сайту, оформлення замовлень і відповідальністю сторін в Online Store.',
		},
	},
};

function buildLocalizedPageCopy(
	page: {
		title: string;
		excerpt: string | null;
		content: string | null;
		metaTitle: string | null;
		metaDescription: string | null;
		slug: string;
	},
	locale: SupportedLocale
): LocalizedPageCopy {
	const localizedOverride = pageLocalizationBySlug[page.slug]?.[locale];
	if (localizedOverride) return localizedOverride;

	return {
		title: page.title,
		excerpt: page.excerpt,
		content: page.content,
		metaTitle: page.metaTitle,
		metaDescription: page.metaDescription,
	};
}

async function syncProductTranslations(locales: readonly SupportedLocale[]) {
	const products = await prisma.product.findMany({
		select: {
			id: true,
			name: true,
			categoryName: true,
			subcategoryName: true,
			slug: true,
			fullSlug: true,
			brand: {
				select: {
					name: true,
				},
			},
		},
	});

	await Promise.all(
		products.flatMap((product) =>
			locales.map((locale) => {
				const localized = buildLocalizedProductCopy(product, locale);
				return prisma.productTranslation.upsert({
					where: {
						productId_locale: {
							productId: product.id,
							locale,
						},
					},
					update: {
						name: localized.name,
						description: localized.description,
						metaTitle: localized.metaTitle,
						metaDescription: localized.metaDescription,
						categoryName: localized.categoryName,
						subcategoryName: localized.subcategoryName,
						slug: product.slug,
						fullSlug: product.fullSlug,
					},
					create: {
						productId: product.id,
						locale,
						name: localized.name,
						description: localized.description,
						metaTitle: localized.metaTitle,
						metaDescription: localized.metaDescription,
						categoryName: localized.categoryName,
						subcategoryName: localized.subcategoryName,
						slug: product.slug,
						fullSlug: product.fullSlug,
					},
				});
			})
		)
	);

	return products.length * locales.length;
}

async function syncCategoryTranslations(locales: readonly SupportedLocale[]) {
	const categories = await prisma.productCategory.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
		},
	});

	await Promise.all(
		categories.flatMap((category) =>
			locales.map((locale) =>
				prisma.productCategoryTranslation.upsert({
					where: {
						categoryId_locale: {
							categoryId: category.id,
							locale,
						},
					},
					update: {
						name: getLocalizedCategoryName(category.name, locale),
						slug: category.slug,
					},
					create: {
						categoryId: category.id,
						locale,
						name: getLocalizedCategoryName(category.name, locale),
						slug: category.slug,
					},
				})
			)
		)
	);

	return categories.length * locales.length;
}

async function syncPageTranslations(locales: readonly SupportedLocale[]) {
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

	await Promise.all(
		pages.flatMap((page) =>
			locales.map((locale) => {
				const localized = buildLocalizedPageCopy(page, locale);
				return prisma.pageTranslation.upsert({
					where: {
						pageId_locale: {
							pageId: page.id,
							locale,
						},
					},
					update: {
						title: localized.title,
						slug: page.slug,
						excerpt: localized.excerpt,
						content: localized.content,
						metaTitle: localized.metaTitle,
						metaDescription: localized.metaDescription,
					},
					create: {
						pageId: page.id,
						locale,
						title: localized.title,
						slug: page.slug,
						excerpt: localized.excerpt,
						content: localized.content,
						metaTitle: localized.metaTitle,
						metaDescription: localized.metaDescription,
					},
				});
			})
		)
	);

	return pages.length * locales.length;
}

async function syncBannerTranslations(locales: readonly SupportedLocale[]) {
	const banners = await prisma.banner.findMany({
		select: {
			id: true,
			title: true,
			subtitle: true,
			linkLabel: true,
		},
	});
	if (!banners.length) return 0;

	const existingRows = await prisma.bannerTranslation.findMany({
		where: {
			bannerId: { in: banners.map((banner) => banner.id) },
			locale: { in: [...locales] },
		},
		select: {
			bannerId: true,
			locale: true,
		},
	});
	const existingKeys = new Set(existingRows.map((row) => `${row.bannerId}:${row.locale}`));
	const rowsToCreate = banners.flatMap((banner) =>
		locales
			.filter((locale) => !existingKeys.has(`${banner.id}:${locale}`))
			.map((locale) => ({
				bannerId: banner.id,
				locale,
				title: banner.title,
				subtitle: banner.subtitle,
				linkLabel: banner.linkLabel,
			}))
	);
	if (!rowsToCreate.length) return 0;

	const result = await prisma.bannerTranslation.createMany({
		data: rowsToCreate,
		skipDuplicates: true,
	});
	return result.count;
}

async function syncLocalizedSeedTranslations(locales: readonly SupportedLocale[]) {
	const [productRows, categoryRows, pageRows, bannerRows] = await Promise.all([
		syncProductTranslations(locales),
		syncCategoryTranslations(locales),
		syncPageTranslations(locales),
		syncBannerTranslations(locales),
	]);

	console.log(
		[
			`Localized rows synced for locales: ${locales.join(', ')}.`,
			`ProductTranslation rows synced: ${productRows}`,
			`ProductCategoryTranslation rows synced: ${categoryRows}`,
			`PageTranslation rows synced: ${pageRows}`,
			`BannerTranslation rows synced: ${bannerRows}`,
		].join('\n')
	);
}

async function main() {
	console.log('🌱 Seeding started...');
	console.log(
		`🧭 Category/subcategory generation: ${SHOULD_GENERATE_CATEGORIES ? 'enabled' : 'disabled'}.`
	);
	console.log(`🛍️ Product generation: ${SHOULD_GENERATE_SEED_PRODUCTS ? 'enabled' : 'disabled'}.`);
	if (SHOULD_GENERATE_PRODUCTS && !SHOULD_GENERATE_CATEGORIES) {
		console.log(
			'ℹ️ Product generation requested, but category generation is disabled. Skipping seed product creation.'
		);
	}

	// Seed expects the database schema to be up-to-date via Prisma migrations.
	// If migrations weren't applied, seeding will fail with cryptic "table does not exist".
	try {
		await prisma.storefrontForm.count();
	} catch (e) {
		const maybePrismaError = e as { code?: string; message?: string } | null;
		if (maybePrismaError?.code === 'P2021') {
			throw new Error(
				[
					'Database schema is not up to date (missing table for StorefrontForm).',
					'Run `npx prisma migrate deploy` (or `npm run db:migrate:deploy`) and then rerun the seed.',
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

	if (SHOULD_GENERATE_CATEGORIES) {
		const deletedSeedSubcategories = await prisma.productCategory.deleteMany({
			where: {
				parentId: { not: null },
				slug: { in: SEEDED_SUBCATEGORY_SLUGS },
			},
		});
		const deletedSeedMainCategories = await prisma.productCategory.deleteMany({
			where: {
				parentId: null,
				slug: { in: SEEDED_MAIN_CATEGORY_SLUGS },
			},
		});
		if (deletedSeedMainCategories.count > 0 || deletedSeedSubcategories.count > 0) {
			console.log(
				`🧹 Removed seeded categories/subcategories: ${deletedSeedMainCategories.count} main, ${deletedSeedSubcategories.count} subcategories.`
			);
		}
	}

	if (mainCategories.length !== SEED_MAIN_CATEGORY_COUNT) {
		throw new Error(
			`Seed expects exactly ${SEED_MAIN_CATEGORY_COUNT} main categories, got ${mainCategories.length}`
		);
	}

	const categoriesWithoutSubcategories = mainCategories.filter(
		(category) => (subcategoriesMap[category] ?? []).length === 0
	);
	if (categoriesWithoutSubcategories.length > 0) {
		throw new Error(
			`Each main category must have at least one subcategory. Missing: ${categoriesWithoutSubcategories.join(
				', '
			)}`
		);
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

		if (category === 'Wearables') {
			add('Памʼять', faker.helpers.arrayElement(VARIANT_OPTIONS.storage));
			add('Батарея', faker.helpers.arrayElement(PRODUCT_ATTRIBUTE_OPTIONS.batteryMah));
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
			Wearables: {
				name: 'Wearables — Specifications',
				attributes: ['Модель', 'Колір', 'Памʼять', 'Батарея', 'Вага', 'Розмір'],
			},
		};

	const ensureAttributeSetForCategory = async (categoryId: string, mainCategoryName: string) => {
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

	const pickSeedSubcategories = (main: string) => {
		const candidates = subcategoriesMap[main] ?? [];
		if (candidates.length === 0) return [];
		const maxCount = Math.min(SEED_SUBCATEGORY_MAX, candidates.length);
		const count = faker.number.int({ min: SEED_SUBCATEGORY_MIN, max: maxCount });
		return faker.helpers.arrayElements(candidates, count);
	};

	const generatedSubcategoriesByMain = new Map<string, string[]>();

	// Categories + Products
	if (SHOULD_GENERATE_CATEGORIES) {
		for (const main of mainCategories) {
			const parentSlug = createSlug(main);
			const parentImage = getCategoryImage(main);
			const parent = await prisma.productCategory.upsert({
				where: { slug: parentSlug },
				update: { name: main, parentId: null, imageUrl: parentImage },
				create: { name: main, slug: parentSlug, parentId: null, imageUrl: parentImage },
			});

			const subs = pickSeedSubcategories(main);
			generatedSubcategoriesByMain.set(main, subs);
			for (const sub of subs) {
				const subSlug = createSlug(sub);
				const subImage = getSubcategoryImage(sub, subSlug);
				const subcategory = await prisma.productCategory.upsert({
					where: { slug: subSlug },
					update: { name: sub, parentId: parent.id, imageUrl: subImage },
					create: { name: sub, slug: subSlug, parentId: parent.id, imageUrl: subImage },
				});

				await ensureAttributeSetForCategory(subcategory.id, main);
				if (!SHOULD_GENERATE_SEED_PRODUCTS) continue;

				const count = faker.number.int({
					min: SEED_PRODUCTS_PER_SUBCATEGORY_MIN,
					max: SEED_PRODUCTS_PER_SUBCATEGORY_MAX,
				});
				for (let i = 0; i < count; i++) {
					const productSeed = `${main}-${sub}-${i}-${nanoid()}`;
					const pickedBrand = stablePick(brands, productSeed);
					const name = buildSemanticProductName(pickedBrand.name, sub, productSeed);
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
					const description = `${name} delivers ${stablePick(
						productHighlightsEn,
						productSlug
					)}. This model is ${stablePick(productUseCasesEn, productSeed)}.`;
					const galleryImageUrls = buildSeedProductGallery(imageUrl, 3);
					const product = await prisma.product.create({
						data: {
							name,
							slug: productSlug,
							fullSlug,
							status: 'ACTIVE',
							categoryName: main,
							subcategoryName: sub,
							description,
							imageUrl,
							basePrice: price,
							discountPrice,
							stock,
							inStock: stock > 0,
							averageRating: 0,
							reviewCount: 0,
							productCode: generateUniqueProductCode(),
							brandId: pickedBrand.id,
							categoryId: subcategory.id,
							tags: [],
							attributes: {
								create: buildProductAttributeValueCreates(main),
							},
							productImages: {
								create: galleryImageUrls.map((url, sortOrder) => ({
									url,
									sortOrder,
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
								price: price.add(new Prisma.Decimal(variant.priceDelta)),
								stock: faker.number.int({
									min: 1,
									max: Math.max(2, Math.floor(stock / 2)),
								}),
								attributes: { create: variantAttributes },
							},
						});
					}

					allProducts.push(product);
				}
			}
		}

		const seededMainCategoryRows = await prisma.productCategory.findMany({
			where: { parentId: null, name: { in: mainCategories } },
			select: {
				name: true,
				_count: {
					select: {
						children: true,
					},
				},
			},
		});
		if (seededMainCategoryRows.length !== mainCategories.length) {
			throw new Error(
				`Expected ${mainCategories.length} main categories, created ${seededMainCategoryRows.length}`
			);
		}
		const mainWithoutSubcategories = seededMainCategoryRows
			.filter((category) => category._count.children < 1)
			.map((category) => category.name);
		if (mainWithoutSubcategories.length > 0) {
			throw new Error(
				`Each main category must have at least one subcategory. Missing subcategories for: ${mainWithoutSubcategories.join(
					', '
				)}`
			);
		}
		const mainWithTooManySubcategories = seededMainCategoryRows
			.filter((category) => category._count.children > SEED_SUBCATEGORY_MAX)
			.map((category) => category.name);
		if (mainWithTooManySubcategories.length > 0) {
			throw new Error(
				`Each main category must have at most ${SEED_SUBCATEGORY_MAX} subcategories. Too many for: ${mainWithTooManySubcategories.join(
					', '
				)}`
			);
		}

		const expectedSubcategoryNames = Array.from(
			new Set(Array.from(generatedSubcategoriesByMain.values()).flat())
		);
		const seededSubcategoryRows = await prisma.productCategory.findMany({
			where: { parentId: { not: null }, name: { in: expectedSubcategoryNames } },
			select: {
				name: true,
				_count: {
					select: {
						products: true,
					},
				},
			},
		});
		if (seededSubcategoryRows.length !== expectedSubcategoryNames.length) {
			throw new Error(
				`Expected ${expectedSubcategoryNames.length} seeded subcategories, created ${seededSubcategoryRows.length}`
			);
		}
		if (SHOULD_GENERATE_SEED_PRODUCTS) {
			const subcategoriesWithoutProducts = seededSubcategoryRows
				.filter((subcategory) => subcategory._count.products < 1)
				.map((subcategory) => subcategory.name);
			if (subcategoriesWithoutProducts.length > 0) {
				throw new Error(
					`Each subcategory must have at least one product. Missing products for: ${subcategoriesWithoutProducts.join(
						', '
					)}`
				);
			}
			const subcategoriesWithTooManyProducts = seededSubcategoryRows
				.filter((subcategory) => subcategory._count.products > SEED_PRODUCTS_PER_SUBCATEGORY_MAX)
				.map((subcategory) => subcategory.name);
			if (subcategoriesWithTooManyProducts.length > 0) {
				throw new Error(
					`Each subcategory must have at most ${SEED_PRODUCTS_PER_SUBCATEGORY_MAX} products. Too many for: ${subcategoriesWithTooManyProducts.join(
						', '
					)}`
				);
			}
		} else {
			console.log('ℹ️ Skipping subcategory product validation (product generation disabled).');
		}
	} else {
		console.log(
			'ℹ️ Skipping category/subcategory generation and related validation (category generation disabled).'
		);
	}

	// Backfill any existing categories/products with missing or unsupported images
	if (SHOULD_GENERATE_CATEGORIES) {
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
	} else {
		console.log('ℹ️ Skipping category image backfill (category generation disabled).');
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

	const productsMissingGallery = await prisma.product.findMany({
		where: {
			imageUrl: { not: null },
			productImages: { none: {} },
		},
		select: { id: true, imageUrl: true },
	});

	for (const product of productsMissingGallery) {
		const primaryUrl = product.imageUrl?.trim();
		if (!primaryUrl) continue;
		const galleryImageUrls = buildSeedProductGallery(primaryUrl, 3);
		if (galleryImageUrls.length === 0) continue;
		await prisma.productImage.createMany({
			data: galleryImageUrls.map((url, sortOrder) => ({
				productId: product.id,
				url,
				sortOrder,
			})),
		});
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

	if (allProducts.length > 0) {
		for (const tag of TAGS) {
			const productsForTag = pickProductsForTag(tag, tagCounts[tag] ?? 8);
			for (const p of productsForTag) {
				await prisma.product.update({
					where: { id: p.id },
					data: { tags: { push: tag } },
				});
			}
		}
	} else {
		console.log('ℹ️ Skipping tag assignment because no seed products were generated.');
	}

	// Promo banners for homepage Promo slider (admin-controlled via Banner)
	const seededPromoBanners = [
		{
			legacyTitle: 'Laptop Deals Week',
			linkUrl: '/products/search/?tag=discount',
			imageUrl:
				'https://fastly.picsum.photos/id/1018/900/900.jpg?hmac=ZOttfaRw0v1KBhmRxLeyN9z1fFAy8uTspj_HcCDbxcU',
			placement: 'promo',
			locales: {
				uk: {
					title: 'Тиждень знижок на ноутбуки',
					subtitle: 'Економте на ультрабуках, ігрових моделях і аксесуарах.',
					linkLabel: 'До ноутбуків',
				},
				en: {
					title: 'Laptop Deals Week',
					subtitle: 'Save on ultrabooks, gaming rigs, and accessories.',
					linkLabel: 'Shop laptops',
				},
			},
		},
		{
			legacyTitle: 'New Arrivals',
			linkUrl: '/products/search/?tag=new',
			imageUrl:
				'https://fastly.picsum.photos/id/573/900/900.jpg?hmac=om04nEh5ahI6QHbnsxmzH5HwwZpl9xVa4KOMt4hReuk',
			placement: 'promo',
			locales: {
				uk: {
					title: 'Нові надходження',
					subtitle: 'Свіжі новинки у всіх категоріях.',
					linkLabel: 'Дивитися новинки',
				},
				en: {
					title: 'New Arrivals',
					subtitle: 'Fresh drops across all categories.',
					linkLabel: 'Browse new',
				},
			},
		},
		{
			legacyTitle: 'Popular Right Now',
			linkUrl: '/products/search/?tag=popular',
			imageUrl:
				'https://fastly.picsum.photos/id/522/900/900.jpg?hmac=WkjG1wM-inQRZ2Jw8HHWtvQeNdal69KOh84yuTX02Iw',
			placement: 'promo',
			locales: {
				uk: {
					title: 'Популярне зараз',
					subtitle: 'Топові товари, які обирають клієнти.',
					linkLabel: 'Дивитися популярне',
				},
				en: {
					title: 'Popular Right Now',
					subtitle: 'Top picks customers love.',
					linkLabel: 'View popular',
				},
			},
		},
	] as const;
	const promoTitlesToReplace = Array.from(
		new Set(
			seededPromoBanners.flatMap((banner) => [
				banner.legacyTitle,
				banner.locales.uk.title,
				banner.locales.en.title,
			])
		)
	);

	await prisma.banner.deleteMany({
		where: {
			placement: 'promo',
			OR: [
				{ title: { in: promoTitlesToReplace } },
				{ linkUrl: { in: seededPromoBanners.map((b) => b.linkUrl) } },
			],
		},
	});

	const createdPromoBanners = await Promise.all(
		seededPromoBanners.map((banner) => {
			const defaultLocaleCopy = banner.locales[DEFAULT_LOCALE];
			return prisma.banner.create({
				data: {
					title: defaultLocaleCopy.title,
					subtitle: defaultLocaleCopy.subtitle,
					linkLabel: defaultLocaleCopy.linkLabel,
					linkUrl: banner.linkUrl,
					imageUrl: banner.imageUrl,
					placement: banner.placement,
					isActive: true,
					startsAt: null,
					endsAt: null,
				},
			});
		})
	);

	await Promise.all(
		createdPromoBanners.flatMap((banner, index) => {
			const source = seededPromoBanners[index];
			return TRANSLATION_LOCALES.map((locale) =>
				prisma.bannerTranslation.upsert({
					where: {
						bannerId_locale: {
							bannerId: banner.id,
							locale,
						},
					},
					update: {
						title: source.locales[locale].title,
						subtitle: source.locales[locale].subtitle,
						linkLabel: source.locales[locale].linkLabel,
					},
					create: {
						bannerId: banner.id,
						locale,
						title: source.locales[locale].title,
						subtitle: source.locales[locale].subtitle,
						linkLabel: source.locales[locale].linkLabel,
					},
				})
			);
		})
	);

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
		},
	});

	if (allProducts.length > 0) {
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
	} else {
		console.log('ℹ️ Skipping demo reviews/orders because no seed products were generated.');
	}

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
			body: 'We use cookies to make the site work. Optional cookies (analytics/marketing) are only used with consent where required.\n\nYou can change your choice later by clearing cookies in your browser.',
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

	await syncLocalizedSeedTranslations(TRANSLATION_LOCALES);

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
