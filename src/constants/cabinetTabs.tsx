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
	display: 'inline-flex',
	gap: 2,
	color: 'main',
	opacity: '0.85',

	// Never shrink — overflow is handled by the list wrapping to a new row
	// (flexWrap='wrap' in TabsHeaders), not by squeezing a pill until its
	// label wraps mid-word.
	flex: '0 0 auto',
	justifyContent: 'center',
	fontSize: '17px',
};
