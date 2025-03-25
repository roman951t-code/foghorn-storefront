import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';

export default function Orders() {
	const t = useTranslations('Sidebar');

	return (
		<VStack mt='4' w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('myOrders')}
			</Heading>
			<AccordionRoot collapsible multiple defaultValue={['order1']} variant='plain'>
				<AccordionItem mb='3' value='order1' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='2xl' fontWeight='normal'>
							Order info
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent></AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
			<AccordionRoot collapsible multiple defaultValue={['payment']} variant='plain'>
				<AccordionItem mb='3' value='order2' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='2xl' fontWeight='normal'>
							Order info
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent></AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
		</VStack>
	);
}
