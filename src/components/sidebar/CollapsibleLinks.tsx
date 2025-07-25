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
	const t = useTranslations('Sidebar');

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
				<AccordionItemTrigger>{t('info')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/about-us' onClick={handleClick}>
						{t('aboutUs')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/public-offer' onClick={handleClick}>
						{t('publicOffer')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/faq' onClick={handleClick}>
						{t('faq')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger>{t('clients')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/shipping-terms' onClick={handleClick}>
						{t('shippingTerms')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' onClick={handleClick}>
						{t('guarantee')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/return-refund' onClick={handleClick}>
						{t('returnRefund')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/terms' onClick={handleClick}>
						{t('terms')}
					</LocaleNavLink>
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
