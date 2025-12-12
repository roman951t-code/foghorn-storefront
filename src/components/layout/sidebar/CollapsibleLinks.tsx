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
					<AccordionItemTrigger fontSize='17px' mb='2'>
						{navT('sidebar.cabinet')}
					</AccordionItemTrigger>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet' onClick={handleClick}>
							<Icon size='md' mr='2'>
								<LuUserRoundCog />
							</Icon>
							{userName ?? navT('sidebar.cabinet')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/orders' onClick={handleClick}>
							<Icon size='md' mr='2'>
								<IoBagCheckOutline />
							</Icon>
							{navT('sidebar.myOrders')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/feedback' onClick={handleClick}>
							<Icon size='md' mr='2'>
								<VscFeedback />
							</Icon>
							{navT('sidebar.myFeedback')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/wishlist' onClick={handleClick}>
							<Icon size='md' mr='2'>
								<FiHeart />
							</Icon>
							{navT('sidebar.wishList')}
						</LocaleNavLink>
					</AccordionItemContent>
					<AccordionItemContent>
						<LocaleNavLink href='/cabinet/reviewed' onClick={handleClick}>
							<Icon size='md' mr='2'>
								<LuUserRoundCheck />
							</Icon>
							{navT('sidebar.reviewedProducts')}
						</LocaleNavLink>
					</AccordionItemContent>
				</AccordionItem>
			)}
			<AccordionItem value='info' borderBottomColor='border.light'>
				<AccordionItemTrigger fontSize='17px' mb='2'>
					{navT('sidebar.info')}
				</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/about-us' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiInfo />
						</Icon>
						{navT('sidebar.aboutUs')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/public-offer' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiFileText />
						</Icon>
						{navT('sidebar.publicOffer')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/faq' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiHelpCircle />
						</Icon>
						{navT('sidebar.faq')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger fontSize='17px' mb='2'>
					{navT('sidebar.clients')}
				</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/shipping-terms' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiTruck />
						</Icon>
						{navT('sidebar.shippingTerms')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiShield />
						</Icon>
						{navT('sidebar.guarantee')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/return-refund' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<FiRefreshCcw />
						</Icon>
						{navT('sidebar.returnRefund')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/terms' onClick={handleClick}>
						<Icon size='md' mr='2'>
							<MdGavel />
						</Icon>
						{navT('sidebar.terms')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
