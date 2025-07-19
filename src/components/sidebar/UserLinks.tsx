import { Stack, Icon } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { IoBagCheckOutline, IoChatboxEllipsesOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { LuUserRoundCheck, LuUserRoundCog } from 'react-icons/lu';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { VscFeedback } from 'react-icons/vsc';

interface Props {
	userName: string;
	onClose: () => void;
}

export default function UserLinks({ userName, onClose }: Props) {
	const t = useTranslations('Sidebar');

	const handleClose = () => {
		if (onClose) onClose();
	};

	return (
		<Stack gap='5' w='fit-content'>
			<LocaleNavLink href='/cabinet' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<LuUserRoundCog />
				</Icon>
				{userName}
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/orders' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<IoBagCheckOutline />
				</Icon>
				{t('myOrders')}
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/feedback' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<VscFeedback />
				</Icon>
				{t('myFeedback')}
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/wishlist' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<FiHeart />
				</Icon>
				{t('wishList')}
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/reviewed' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<LuUserRoundCheck />
				</Icon>
				{t('reviewedProducts')}
			</LocaleNavLink>

			<LocaleNavLink href='/cabinet/chat' onClick={handleClose}>
				<Icon size='md' mr='2' verticalAlign='top'>
					<IoChatboxEllipsesOutline />
				</Icon>
				{t('chat')}
			</LocaleNavLink>
		</Stack>
	);
}
