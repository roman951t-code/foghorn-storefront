'use client';
import { Tabs, Icon, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { FiHeart, FiEye } from 'react-icons/fi';
import { LuUserRoundCog } from 'react-icons/lu';
import { useRouter } from '@/i18n/routing';
import { LuListChecks } from 'react-icons/lu';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';

import { VscFeedback } from 'react-icons/vsc';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default function CabinetLayout({ children, params }: Props) {
	const t = useTranslations('Sidebar');
	const router = useRouter();

	const handleNavigation = (href: string) => {
		router.push(href);
	};

	return (
		<Tabs.Root
			defaultValue='main'
			colorPalette='orange'
			orientation='vertical'
			variant='line'
			px='3'
		>
			<Box position='sticky' top='74px' h='100%' rounded='sm'>
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
						value={t('myOrders')}
						color='main'
						fontWeight='normal'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/orders')}
					>
						<Icon size='md'>
							<LuListChecks />
						</Icon>
						{t('myOrders')}
					</Tabs.Trigger>
					<Tabs.Trigger
						value={t('myFeedback')}
						color='main'
						fontWeight='normal'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/feedback')}
					>
						<Icon size='md'>
							<VscFeedback />
						</Icon>
						{t('myFeedback')}
					</Tabs.Trigger>
					<Tabs.Trigger
						value={t('wishList')}
						color='main'
						fontWeight='normal'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/wishlist')}
					>
						<Icon size='md'>
							<FiHeart />
						</Icon>
						{t('wishList')}
					</Tabs.Trigger>
					<Tabs.Trigger
						value={t('reviewedProducts')}
						color='main'
						fontWeight='normal'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/reviewed')}
					>
						<Icon size='md'>
							<FiEye />
						</Icon>
						{t('reviewedProducts')}
					</Tabs.Trigger>
					<Tabs.Trigger
						value={t('chat')}
						color='main'
						fontWeight='normal'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/chat')}
					>
						<Icon size='md'>
							<IoChatboxEllipsesOutline />
						</Icon>
						{t('chat')}
					</Tabs.Trigger>
				</Tabs.List>
			</Box>

			<Tabs.Content w='full' value='main'>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('myOrders')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('myFeedback')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('wishList')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('reviewedProducts')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('chat')}>
				{children}
			</Tabs.Content>
		</Tabs.Root>
	);
}
