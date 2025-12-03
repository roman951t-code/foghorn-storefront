import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Icon } from '@chakra-ui/react';
import {
	FiInfo,
	FiFileText,
	FiHelpCircle,
	FiTruck,
	FiShield,
	FiRefreshCcw,
	FiHeart,
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { IoBagCheckOutline } from 'react-icons/io5';
import { LuUserRoundCheck, LuUserRoundCog } from 'react-icons/lu';
import { VscFeedback } from 'react-icons/vsc';

interface Props {
	onClose: () => void;
	userName?: string;
	isAuthorized?: boolean;
}

export default function CollapsibleLinks({ onClose, userName, isAuthorized }: Props) {
	const navT = useTranslations('navigation');
	const defaultItems: string[] = ['info', 'clients'];

	if (isAuthorized) {
		defaultItems.unshift('cabinet');
	}

	const handleClick = () => {
		if (onClose) onClose();
	};

	return (
		<AccordionRoot
			multiple
			defaultValue={defaultItems}
			collapsible={false}
			onValueChange={() => {}}
		>
			{isAuthorized && (
				<AccordionItem value='cabinet' borderBottomColor='border.light'>
					<AccordionItemTrigger>{navT('sidebar.cabinet')}</AccordionItemTrigger>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet' onClick={handleClick}>
							<Icon size='md' mr='2' verticalAlign='top'>
								<LuUserRoundCog />
							</Icon>
							{userName ?? navT('sidebar.cabinet')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/orders' onClick={handleClick}>
							<Icon size='md' mr='2' verticalAlign='top'>
								<IoBagCheckOutline />
							</Icon>
							{navT('sidebar.myOrders')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/feedback' onClick={handleClick}>
							<Icon size='md' mr='2' verticalAlign='top'>
								<VscFeedback />
							</Icon>
							{navT('sidebar.myFeedback')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/wishlist' onClick={handleClick}>
							<Icon size='md' mr='2' verticalAlign='top'>
								<FiHeart />
							</Icon>
							{navT('sidebar.wishList')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/reviewed' onClick={handleClick}>
							<Icon size='md' mr='2' verticalAlign='top'>
								<LuUserRoundCheck />
							</Icon>
							{navT('sidebar.reviewedProducts')}
						</LocaleNavLink>
					</AccordionItemContent>
				</AccordionItem>
			)}
			<AccordionItem value='info' borderBottomColor='border.light'>
				<AccordionItemTrigger>{navT('sidebar.info')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/about-us' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiInfo />
						</Icon>
						{navT('sidebar.aboutUs')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/public-offer' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiFileText />
						</Icon>
						{navT('sidebar.publicOffer')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/faq' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiHelpCircle />
						</Icon>
						{navT('sidebar.faq')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger>{navT('sidebar.clients')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/shipping-terms' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiTruck />
						</Icon>
						{navT('sidebar.shippingTerms')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiShield />
						</Icon>
						{navT('sidebar.guarantee')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/return-refund' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<FiRefreshCcw />
						</Icon>
						{navT('sidebar.returnRefund')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/terms' onClick={handleClick}>
						<Icon size='md' mr='2' verticalAlign='top'>
							<MdGavel />
						</Icon>
						{navT('sidebar.terms')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
