import { IconType } from 'react-icons';
import { FiHeart } from 'react-icons/fi';
import { LuUserRoundCheck, LuUserRoundCog } from 'react-icons/lu';
import { IoBagCheckOutline } from 'react-icons/io5';
import { VscFeedback } from 'react-icons/vsc';

export type CabinetTabValue = 'cabinet' | 'orders' | 'feedback' | 'wishlist' | 'reviewed';

export const CABINET_TABS: Array<{
	value: CabinetTabValue;
	labelKey: string;
	icon: IconType;
	usesName?: boolean;
}> = [
	{ value: 'cabinet', labelKey: 'sidebar.cabinet', icon: LuUserRoundCog, usesName: true },
	{ value: 'orders', labelKey: 'sidebar.myOrders', icon: IoBagCheckOutline },
	{ value: 'feedback', labelKey: 'sidebar.myFeedback', icon: VscFeedback },
	{ value: 'wishlist', labelKey: 'sidebar.wishList', icon: FiHeart },
	{ value: 'reviewed', labelKey: 'sidebar.reviewedProducts', icon: LuUserRoundCheck },
];

export const CABINET_TAB_ROUTE_SUFFIXES: Record<CabinetTabValue, string> = {
	cabinet: '',
	orders: '/orders',
	feedback: '/feedback',
	wishlist: '/wishlist',
	reviewed: '/reviewed',
};

export const CABINET_TAB_TRIGGER_PROPS = {
	color: 'main',
	fontWeight: 'medium',
	fontSize: 'md',
	display: 'inline-flex',
	gap: 2,
	flex: '0 1 auto',
	justifyContent: 'center',
};
