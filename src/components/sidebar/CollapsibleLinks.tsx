import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';

export default function CollapsibleLinks({ onClose }) {
	const t = useTranslations('Sidebar');

	const handleClick = () => {
		if (onClose) onClose();
	};

	return (
		<AccordionRoot multiple defaultValue={['info']}>
			<AccordionItem value='info' borderBottomColor='border.light'>
				<AccordionItemTrigger>{t('info')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/aboutUs'>{t('aboutUs')}</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/publicOffer' onClick={handleClick}>
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
					<LocaleNavLink href='/shippingTerms' onClick={handleClick}>
						{t('shippingTerms')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' onClick={handleClick}>
						{t('guarantee')}
					</LocaleNavLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/returnRefund' onClick={handleClick}>
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
