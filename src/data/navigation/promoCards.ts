export type PromoCard = {
	id: 'popular' | 'new' | 'discount';
	tag: 'popular' | 'new' | 'discount';
	text: string;
};

export const PROMO_CARDS: PromoCard[] = [
	{ id: 'popular', text: '🔥 Up to 50% off on all electronics!', tag: 'popular' },
	{ id: 'new', text: '🚚 Free shipping on orders over $100!', tag: 'new' },
	{ id: 'discount', text: '💳 Pay later with our flexible payment options!', tag: 'discount' },
];
