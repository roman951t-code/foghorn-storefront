import { ASSET_IMAGES } from '@/constants/assets';

export const ORDER_CARD_MOCK_PRODUCT_IMAGES = {
	img1: ASSET_IMAGES.tempProduct1,
	img2: ASSET_IMAGES.tempProduct2,
} as const;

export const ORDER_CARD_MOCK_ITEMS = [
	{
		name: 'Alex',
		bio: '',
		image: 'https://i.pravatar.cc/150?u=a',
		topRated: false,
	},
] as const;
