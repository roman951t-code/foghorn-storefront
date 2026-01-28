export type PromoCard = {
	id: string;
	text: string;
	href?: string;
	imageUrl?: string;
};

export const PROMO_CARDS: PromoCard[] = [
	{
		id: 'popular',
		text: '🔥 Up to 50% off on all electronics!',
		href: '/products/search/?tag=popular',
	},
	{
		id: 'new',
		text: '🚚 Free shipping on orders over $100!',
		href: '/products/search/?tag=new',
	},
	{
		id: 'discount',
		text: '💳 Pay later with our flexible payment options!',
		href: '/products/search/?tag=discount',
	},
];
