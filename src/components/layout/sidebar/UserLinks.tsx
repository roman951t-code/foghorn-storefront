import { Stack, Icon } from '@chakra-ui/react';
import { FiHeart, FiEye } from 'react-icons/fi';
import { LuListChecks } from 'react-icons/lu';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { LuUserRoundCog } from 'react-icons/lu';
import LocaleNavLink from '@/components/reusable/links/LocaleNavLink';
import { VscFeedback } from 'react-icons/vsc';

export default function UserLinks({ onClose }) {
	const t = useTranslations('Sidebar');

	const handleClick = () => {
		if (onClose) onClose();
	};

	return (
		<Stack gap={6}>
			<LocaleNavLink href='/cabinet' text='Роман Онищенко' onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<LuUserRoundCog />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/orders' text={t('myOrders')} onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<LuListChecks />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/feedback' text={t('myFeedback')} onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<VscFeedback />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/wishlist' text={t('wishList')} onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<FiHeart />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/reviewed' text={t('reviewedProducts')} onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<FiEye />
				</Icon>
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/chat' text={t('chat')} onClick={handleClick}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<IoChatboxEllipsesOutline />
				</Icon>
			</LocaleNavLink>
		</Stack>
	);
}
