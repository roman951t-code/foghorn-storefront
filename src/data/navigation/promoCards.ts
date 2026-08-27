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
		imageUrl:
			'https://fastly.picsum.photos/id/522/900/900.jpg?hmac=WkjG1wM-inQRZ2Jw8HHWtvQeNdal69KOh84yuTX02Iw',
	},
	{
		id: 'new',
		text: '🚚 Free shipping on orders over $100!',
		subtitle: 'Fast delivery to your door.',
		href: '/products/search/?tag=new',
		linkLabel: 'Browse new',
		imageUrl:
			'https://fastly.picsum.photos/id/573/900/900.jpg?hmac=om04nEh5ahI6QHbnsxmzH5HwwZpl9xVa4KOMt4hReuk',
	},
	{
		id: 'discount',
		text: '💳 Pay later with our flexible payment options!',
		subtitle: 'Split payments, pay comfortably.',
		href: '/products/search/?tag=discount',
		linkLabel: 'Learn more',
		imageUrl:
			'https://fastly.picsum.photos/id/1018/900/900.jpg?hmac=ZOttfaRw0v1KBhmRxLeyN9z1fFAy8uTspj_HcCDbxcU',
	},
];
