'use client';
import { Tabs, Icon, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { FiHeart, FiEye } from 'react-icons/fi';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { LuMessageSquareMore } from 'react-icons/lu';
import { GrChatOption } from 'react-icons/gr';
import { LuUserRoundCog } from 'react-icons/lu';
import { useRouter } from '@/i18n/routing';

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
			mt='4'
			defaultValue='main'
			colorPalette='orange'
			orientation='vertical'
			lazyMount
			variant='line'
		>
			<Box position='sticky' top='74px' h='100%'>
				<Tabs.List mb='4' minW='214px' gap='2' hideBelow='md'>
					<Tabs.Trigger
						pl='12px'
						value='main'
						color='main'
						fontWeight='normal'
						fontSize='15px'
						textAlign='left'
						onClick={() => handleNavigation('/cabinet')}
					>
						<Icon size='md'>
							<LuUserRoundCog />
						</Icon>
						Роман Онищенко
					</Tabs.Trigger>
					<Tabs.Trigger
						pl='12px'
						value={t('myOrders')}
						color='main'
						fontWeight='normal'
						textAlign='left'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/orders')}
					>
						<Icon size='md'>
							<AiOutlineUnorderedList />
						</Icon>
						{t('myOrders')}
					</Tabs.Trigger>
					<Tabs.Trigger
						pl='12px'
						value={t('myFeedback')}
						color='main'
						fontWeight='normal'
						textAlign='left'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/feedback')}
					>
						<Icon size='md'>
							<LuMessageSquareMore />
						</Icon>
						{t('myFeedback')}
					</Tabs.Trigger>
					<Tabs.Trigger
						pl='12px'
						value={t('wishList')}
						fontWeight='normal'
						textAlign='left'
						color='main'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/wishlist')}
					>
						<Icon size='md'>
							<FiHeart />
						</Icon>
						{t('wishList')}
					</Tabs.Trigger>
					<Tabs.Trigger
						pl='12px'
						value={t('reviewedProducts')}
						color='main'
						textAlign='left'
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
						pl='12px'
						value={t('chat')}
						color='main'
						fontWeight='normal'
						textAlign='left'
						fontSize='15px'
						onClick={() => handleNavigation('/cabinet/chat')}
					>
						<Icon size='md'>
							<GrChatOption />
						</Icon>
						{t('chat')}
					</Tabs.Trigger>
				</Tabs.List>
			</Box>

			<Tabs.Content w='full' pr='4' value='main'>
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
