import { Stack, Icon } from '@chakra-ui/react';
import { FiHeart, FiEye } from 'react-icons/fi';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { LuMessageSquareMore } from 'react-icons/lu';
import { GrChatOption } from 'react-icons/gr';
import { useTranslations } from 'next-intl';
import { LuUserRoundCog } from 'react-icons/lu';
import LocaleNavLink from '@/components/reusable/links/LocaleNavLink';

export default function UserLinks() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6}>
			<LocaleNavLink href='/cabinet' text='Роман Онищенко'>
				<Icon size='md' mr='2'>
					<LuUserRoundCog />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/orders' text={t('myOrders')}>
				<Icon size='md' mr='2'>
					<AiOutlineUnorderedList />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/feedback' text={t('myFeedback')}>
				<Icon size='md' mr='2'>
					<LuMessageSquareMore />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/wishlist' text={t('wishList')}>
				<Icon size='md' mr='2'>
					<FiHeart />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/reviewed' text={t('reviewedProducts')}>
				<Icon size='md' mr='2'>
					<FiEye />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/chat' text={t('chat')}>
				<Icon size='md' mr='2'>
					<GrChatOption />
				</Icon>
			</LocaleNavLink>
		</Stack>
	);
}
