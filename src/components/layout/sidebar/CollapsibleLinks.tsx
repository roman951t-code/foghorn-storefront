import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import LocaleNavLink from '@/components/reusable/links/LocaleNavLink';

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
					<LocaleNavLink href='/aboutUs' text={t('aboutUs')} onClick={handleClick} />
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/publicOffer' text={t('publicOffer')} onClick={handleClick} />
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/faq' text={t('faq')} onClick={handleClick} />
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger>{t('clients')}</AccordionItemTrigger>
				<AccordionItemContent>
					<LocaleNavLink href='/shippingTerms' text={t('shippingTerms')} onClick={handleClick} />
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/guarantee' text={t('guarantee')} onClick={handleClick} />
				</AccordionItemContent>
				<AccordionItemContent>
					<LocaleNavLink href='/returnRefund' text={t('returnRefund')} onClick={handleClick} />
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
