export type PromoCard = {
	id: string;
	text: string;
	subtitle?: string;
	href?: string;
	linkLabel?: string;
	imageUrl?: string;
};

export const PROMO_CARDS: PromoCard[] = [
	{
		id: 'popular',
		text: '🔥 Up to 50% off on all electronics!',
		subtitle: 'Limited-time deals on best sellers.',
		href: '/products/search/?tag=popular',
		linkLabel: 'Shop deals',
		imageUrl: '/products/demo/camera-desk.webp',
	},
	{
		id: 'new',
		text: '🚚 Free shipping on orders over $100!',
		subtitle: 'Fast delivery to your door.',
		href: '/products/search/?tag=new',
		linkLabel: 'Browse new',
		imageUrl: '/products/demo/audio-desk.webp',
	},
	{
		id: 'discount',
		text: '💳 Pay later with our flexible payment options!',
		subtitle: 'Split payments, pay comfortably.',
		href: '/products/search/?tag=discount',
		linkLabel: 'Learn more',
		imageUrl: '/products/demo/tech-desk.webp',
	},
];
