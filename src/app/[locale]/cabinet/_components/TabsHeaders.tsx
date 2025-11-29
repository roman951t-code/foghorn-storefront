'use client';
import { Tabs, Icon } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { LuUserRoundCog } from 'react-icons/lu';
import { IoBagCheckOutline } from 'react-icons/io5';
import { VscFeedback } from 'react-icons/vsc';
import { LuUserRoundCheck } from 'react-icons/lu';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { useSession } from '@/providers/SessionProvider';
import { useTranslations } from 'next-intl';

export default function TabsList() {
	const navT = useTranslations('navigation');
	const { session } = useSession();

	return (
		<Tabs.List mb='4' gap='2' hideBelow='xs' flexWrap='wrap' justifyContent='center'>
			<Tabs.Trigger value='cabinet' color='main' fontWeight='normal' fontSize='md' asChild>
				<LocaleNavLink href='/cabinet' _hover={{ textDecoration: 'none' }}>
					<Icon size='md'>
						<LuUserRoundCog />
					</Icon>
					{session?.user?.name}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'orders'} color='main' fontWeight='normal' fontSize='md' asChild>
				<LocaleNavLink href='/cabinet/orders' _hover={{ textDecoration: 'none' }}>
					<Icon size='md'>
						<IoBagCheckOutline />
					</Icon>
					{navT('sidebar.myOrders')}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'feedback'} color='main' fontWeight='normal' fontSize='md' asChild>
				<LocaleNavLink href='/cabinet/feedback' _hover={{ textDecoration: 'none' }}>
					<Icon size='md'>
						<VscFeedback />
					</Icon>
					{navT('sidebar.myFeedback')}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'wishlist'} color='main' fontWeight='normal' fontSize='md' asChild>
				<LocaleNavLink href='/cabinet/wishlist' _hover={{ textDecoration: 'none' }}>
					<Icon size='md'>
						<FiHeart />
					</Icon>
					{navT('sidebar.wishList')}
				</LocaleNavLink>
			</Tabs.Trigger>
			<Tabs.Trigger value={'reviewed'} color='main' fontWeight='normal' fontSize='md' asChild>
				<LocaleNavLink href='/cabinet/reviewed' _hover={{ textDecoration: 'none' }}>
					<Icon size='md'>
						<LuUserRoundCheck />
					</Icon>
					{navT('sidebar.reviewedProducts')}
				</LocaleNavLink>
			</Tabs.Trigger>
		</Tabs.List>
	);
}
