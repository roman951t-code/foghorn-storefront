import type { AppLocale } from '@/constants/locales';

const faqData: Record<AppLocale, { question: string; answer: string }[]> = {
	uk: [
		{
			question: 'Що таке повернення товару?',
			answer: 'Ми приймаємо повернення протягом 30 днів після покупки.',
		},
		{
			question: 'Чи доступна міжнародна доставка?',
			answer: 'Так, ми доставляємо товари у більшість країн світу.',
		},
	],
	en: [
		{
			question: 'What is your return policy?',
			answer: 'We accept returns within 30 days of purchase.',
		},
		{
			question: 'Is international shipping available?',
			answer: 'Yes, we ship to most countries worldwide.',
		},
	],
};

export default faqData;
