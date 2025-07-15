'use client';
import { Tabs, Icon } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { LuUserRoundCog } from 'react-icons/lu';
import { IoBagCheckOutline } from 'react-icons/io5';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { VscFeedback } from 'react-icons/vsc';
import { LuUserRoundCheck } from 'react-icons/lu';
import type { I18nData } from '@/types/i18n';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { useSession } from '@/components/providers/SessionProvider';

interface Props {
	i18nData: I18nData;
}

export default function TabsList({ i18nData }: Props) {
	const { session } = useSession();

	return (
		<Tabs.List mb='4' gap='2' hideBelow='xs' flexWrap='wrap' justifyContent='center'>
			<Tabs.Trigger value='cabinet' color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<LuUserRoundCog />
					</Icon>
					{session?.user?.name}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'orders'} color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet/orders' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<IoBagCheckOutline />
					</Icon>
					{i18nData.myOrders}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'feedback'} color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet/feedback' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<VscFeedback />
					</Icon>
					{i18nData.myFeedback}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'wishlist'} color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet/wishlist' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<FiHeart />
					</Icon>
					{i18nData.wishList}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'reviewed'} color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet/reviewed' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<LuUserRoundCheck />
					</Icon>
					{i18nData.reviewedProducts}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'chat'} color='main' fontWeight='normal' fontSize='15px' asChild>
				<LocaleNavLink href='/cabinet/chat' _hover={{ textDecoration: 'none' }}>
					<Icon size='md' hideBelow='lg'>
						<IoChatboxEllipsesOutline />
					</Icon>
					{i18nData.chat}
				</LocaleNavLink>
			</Tabs.Trigger>
		</Tabs.List>
	);
}
