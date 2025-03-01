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
			<LocaleNavLink href='#' text='Роман Онищенко'>
				<Icon size='md'>
					<LuUserRoundCog />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='#' text={t('myOrders')}>
				<Icon size='md'>
					<AiOutlineUnorderedList />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='#' text={t('myFeedback')}>
				<Icon size='md'>
					<LuMessageSquareMore />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='#' text={t('wishList')}>
				<Icon size='md'>
					<FiHeart />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='#' text={t('reviewedProducts')}>
				<Icon size='md'>
					<FiEye />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='#' text={t('chat')}>
				<Icon size='md'>
					<GrChatOption />
				</Icon>
			</LocaleNavLink>
		</Stack>
	);
}
