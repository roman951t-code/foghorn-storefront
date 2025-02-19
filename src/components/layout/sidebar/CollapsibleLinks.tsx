import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import SidebarLink from './SidebarLink';

export default function CollapsibleLinks() {
	const t = useTranslations('Sidebar');

	return (
		<AccordionRoot multiple defaultValue={['info']}>
			<AccordionItem value='info' borderBottomColor='border.light'>
				<AccordionItemTrigger>{t('info')}</AccordionItemTrigger>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('aboutUs')}</SidebarLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('publicOffer')}</SidebarLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('faq')}</SidebarLink>
				</AccordionItemContent>
			</AccordionItem>
			<AccordionItem value='clients' borderBottomColor='border.light'>
				<AccordionItemTrigger>{t('clients')}</AccordionItemTrigger>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('shippingTerms')}</SidebarLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('guarantee')}</SidebarLink>
				</AccordionItemContent>
				<AccordionItemContent>
					<SidebarLink href='#'>{t('returnRefund')}</SidebarLink>
				</AccordionItemContent>
			</AccordionItem>
		</AccordionRoot>
	);
}
