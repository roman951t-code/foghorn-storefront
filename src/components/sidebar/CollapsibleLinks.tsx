import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/reusable/chakra/accordion';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';

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
						{navT('sidebar.aboutUs')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/public-offer' onClick={handleClick}>
						{navT('sidebar.publicOffer')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/faq' onClick={handleClick}>
						{navT('sidebar.faq')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger>{navT('sidebar.clients')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/shipping-terms' onClick={handleClick}>
						{navT('sidebar.shippingTerms')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' onClick={handleClick}>
						{navT('sidebar.guarantee')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/return-refund' onClick={handleClick}>
						{navT('sidebar.returnRefund')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/terms' onClick={handleClick}>
						{navT('sidebar.terms')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
