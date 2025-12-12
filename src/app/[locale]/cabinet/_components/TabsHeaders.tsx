'use client';
import { Tabs, Icon } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { LuUserRoundCog } from 'react-icons/lu';
import { IoBagCheckOutline } from 'react-icons/io5';
import { VscFeedback } from 'react-icons/vsc';
import { LuUserRoundCheck } from 'react-icons/lu';
import { useSession } from '@/providers/SessionProvider';
import { useTranslations } from 'next-intl';

const triggerProps = {
	color: 'main',
	fontWeight: 'normal',
	fontSize: 'md',
	display: 'inline-flex',
	gap: 2,
	flex: '0 1 auto',
	justifyContent: 'center',
};

export default function TabsList() {
	const navT = useTranslations('navigation');
	const { session } = useSession();

	return (
		<Tabs.List
			my='4'
			gapX='4'
			rowGap='3'
			hideBelow='xs'
			flexWrap='wrap'
			justifyContent='center'
			w='full'
		>
			<Tabs.Trigger value='cabinet' {...triggerProps}>
				<Icon size='md'>
					<LuUserRoundCog />
				</Icon>
				{session?.user?.name}
			</Tabs.Trigger>
			<Tabs.Trigger value={'orders'} {...triggerProps}>
				<Icon size='md'>
					<IoBagCheckOutline />
				</Icon>
				{navT('sidebar.myOrders')}
			</Tabs.Trigger>
			<Tabs.Trigger value={'feedback'} {...triggerProps}>
				<Icon size='md'>
					<VscFeedback />
				</Icon>
				{navT('sidebar.myFeedback')}
			</Tabs.Trigger>
			<Tabs.Trigger value={'wishlist'} {...triggerProps}>
				<Icon size='md'>
					<FiHeart />
				</Icon>
				{navT('sidebar.wishList')}
			</Tabs.Trigger>
			<Tabs.Trigger value={'reviewed'} {...triggerProps}>
				<Icon size='md'>
					<LuUserRoundCheck />
				</Icon>
				{navT('sidebar.reviewedProducts')}
			</Tabs.Trigger>
		</Tabs.List>
	);
}
