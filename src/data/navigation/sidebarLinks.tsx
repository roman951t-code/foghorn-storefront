import { IconType } from 'react-icons';
import {
	FiInfo,
	FiFileText,
	FiHelpCircle,
	FiTruck,
	FiShield,
	FiRefreshCcw,
	FiHeart,
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { IoBagCheckOutline } from 'react-icons/io5';
import { LuUserRoundCheck, LuUserRoundCog } from 'react-icons/lu';
import { VscFeedback } from 'react-icons/vsc';

export type SidebarLink = {
	href: string;
	labelKey: string;
	icon: IconType;
	useUserName?: boolean;
};

export type SidebarSection = {
	value: 'cabinet' | 'info' | 'clients';
	requiresAuth?: boolean;
	links: SidebarLink[];
};

export const SIDEBAR_SECTIONS: SidebarSection[] = [
	{
		value: 'cabinet',
		requiresAuth: true,
		links: [
			{ href: '/cabinet', labelKey: 'sidebar.cabinet', icon: LuUserRoundCog, useUserName: true },
			{ href: '/cabinet/orders', labelKey: 'sidebar.myOrders', icon: IoBagCheckOutline },
			{ href: '/cabinet/feedback', labelKey: 'sidebar.myFeedback', icon: VscFeedback },
			{ href: '/cabinet/wishlist', labelKey: 'sidebar.wishList', icon: FiHeart },
			{ href: '/cabinet/reviewed', labelKey: 'sidebar.reviewedProducts', icon: LuUserRoundCheck },
		],
	},
	{
		value: 'info',
		links: [
			{ href: '/about-us', labelKey: 'sidebar.aboutUs', icon: FiInfo },
			{ href: '/public-offer', labelKey: 'sidebar.publicOffer', icon: FiFileText },
			{ href: '/faq', labelKey: 'sidebar.faq', icon: FiHelpCircle },
		],
	},
	{
		value: 'clients',
		links: [
			{ href: '/shipping-terms', labelKey: 'sidebar.shippingTerms', icon: FiTruck },
			{ href: '/guarantee', labelKey: 'sidebar.guarantee', icon: FiShield },
			{ href: '/return-refund', labelKey: 'sidebar.returnRefund', icon: FiRefreshCcw },
			{ href: '/terms', labelKey: 'sidebar.terms', icon: MdGavel },
			{ href: '/privacy-policy', labelKey: 'sidebar.privacyPolicy', icon: FiFileText },
			{ href: '/cookie-policy', labelKey: 'sidebar.cookiePolicy', icon: FiFileText },
		],
	},
];

export const SIDEBAR_DEFAULT_ITEMS: SidebarSection['value'][] = ['info', 'clients'];
