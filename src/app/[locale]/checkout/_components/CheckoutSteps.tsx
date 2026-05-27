'use client';

import { VStack, Heading, Box } from '@chakra-ui/react';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/ui/Skeleton';

import AuthStep from './AuthStep';

function StepLoadingFallback() {
	return (
		<Box mt='4'>
			<LoadingSkeleton />
		</Box>
	);
}

const ShipmentStep = dynamic(() => import('./ShipmentStep'), {
	loading: () => <StepLoadingFallback />,
	ssr: false,
});

const PaymentStep = dynamic(() => import('./PaymentStep'), {
	loading: () => <StepLoadingFallback />,
	ssr: false,
});

export default function CheckoutSteps() {
	const t = useTranslations('products');
	const authT = useTranslations('auth');
	const sectionStyles = {
		mt: '4',
		borderWidth: '0.5px',
		borderStyle: 'solid',
		borderColor: 'border',
		borderRadius: 'lg',
		p: { base: 4, md: 6 },
		bg: 'bg.tertiary',
	};

	return (
		<VStack mt='4' w='100%'>
			<AccordionRoot
				collapsible
				multiple
				defaultValue={['contacts', 'shipment', 'payment']}
				variant='plain'
			>
				<AccordionItem mb='6' value='contacts' borderBottomColor='border'>
					<AccordionItemTrigger>
						<Heading as='h2' size='xl' fontWeight='medium'>
							{authT('contacts')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<AuthStep />
					</AccordionItemContent>
				</AccordionItem>
				<AccordionItem mb='6' value='shipment' borderBottomColor='border'>
					<AccordionItemTrigger>
						<Heading as='h2' size='xl' fontWeight='medium'>
							{t('shipment')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<Box {...sectionStyles}>
							<ShipmentStep />
						</Box>
					</AccordionItemContent>
				</AccordionItem>
				<AccordionItem mb='6' value='payment' borderBottomColor='border'>
					<AccordionItemTrigger>
						<Heading as='h2' size='xl' fontWeight='medium'>
							{t('payment')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<Box {...sectionStyles}>
							<PaymentStep />
						</Box>
					</AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
		</VStack>
	);
}
