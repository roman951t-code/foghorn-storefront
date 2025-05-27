'use client';
import { Tabs, Icon } from '@chakra-ui/react';
import { FiHeart, FiEye } from 'react-icons/fi';
import { LuUserRoundCog } from 'react-icons/lu';
import { useRouter } from '@/i18n/routing';
import { LuListChecks } from 'react-icons/lu';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { VscFeedback } from 'react-icons/vsc';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function TabsList({ i18nData }: Props) {
	const router = useRouter();

	const handleNavigation = (href: string) => {
		router.push(href);
	};

	return (
		<Tabs.List mb='4' minW='220px' gap='2' hideBelow='md' bg='bg.tertiary' pb='2'>
			<Tabs.Trigger
				value='main'
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet')}
			>
				<Icon size='md'>
					<LuUserRoundCog />
				</Icon>
				Роман Онищенко
			</Tabs.Trigger>
			<Tabs.Trigger
				value={i18nData.myOrders}
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet/orders')}
			>
				<Icon size='md'>
					<LuListChecks />
				</Icon>
				{i18nData.myOrders}
			</Tabs.Trigger>
			<Tabs.Trigger
				value={i18nData.myFeedback}
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet/feedback')}
			>
				<Icon size='md'>
					<VscFeedback />
				</Icon>
				{i18nData.myFeedback}
			</Tabs.Trigger>
			<Tabs.Trigger
				value={i18nData.wishList}
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet/wishlist')}
			>
				<Icon size='md'>
					<FiHeart />
				</Icon>
				{i18nData.wishList}
			</Tabs.Trigger>
			<Tabs.Trigger
				value={i18nData.reviewedProducts}
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet/reviewed')}
			>
				<Icon size='md'>
					<FiEye />
				</Icon>
				{i18nData.reviewedProducts}
			</Tabs.Trigger>
			<Tabs.Trigger
				value={i18nData.chat}
				color='main'
				fontWeight='normal'
				fontSize='15px'
				onClick={() => handleNavigation('/cabinet/chat')}
			>
				<Icon size='md'>
					<IoChatboxEllipsesOutline />
				</Icon>
				{i18nData.chat}
			</Tabs.Trigger>
		</Tabs.List>
	);
}
