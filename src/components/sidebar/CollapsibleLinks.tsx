import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/reusable/chakra/accordion';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { Icon } from '@chakra-ui/react';
import {
	FiInfo,
	FiFileText,
	FiHelpCircle,
	FiTruck,
	FiShield,
	FiRefreshCcw,
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';

interface Props {
	onClose: () => void;
}

export default function CollapsibleLinks({ onClose }: Props) {
	const navT = useTranslations('navigation');

	const handleClick = () => {
		if (onClose) onClose();
	};

	return (
		<AccordionRoot
			multiple
			defaultValue={['info', 'clients']}
			collapsible={false}
			onValueChange={() => {}}
		>
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
