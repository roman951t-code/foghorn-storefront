import { VStack, Heading } from '@chakra-ui/react';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import AuthStep from './AuthStep';
import ShipmentStep from './ShipmentStep';
import PaymentStep from './PaymentStep';

export default function CheckoutSteps() {
	const t = useTranslations('Products');
	const authT = useTranslations('Auth');

	return (
		<VStack mt='4' w='100%'>
			<AccordionRoot collapsible multiple defaultValue={['payment']} variant='plain'>
				<AccordionItem mb='3' value='contacts' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='3xl' fontWeight='normal'>
							{authT('contacts')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<AuthStep />
					</AccordionItemContent>
				</AccordionItem>
				<AccordionItem mb='3' value='shipment' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='3xl' fontWeight='normal'>
							{t('shipment')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>{<ShipmentStep />}</AccordionItemContent>
				</AccordionItem>
				<AccordionItem mb='3' value='payment' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='3xl' fontWeight='normal'>
							{t('payment')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<PaymentStep />
					</AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
		</VStack>
	);
}
