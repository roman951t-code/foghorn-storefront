import { Flex, Group, Box, Heading } from '@chakra-ui/react';
import CheckoutSteps from '@/components/pages/checkout/CheckoutSteps';
import OrderInfo from '@/components/pages/checkout/OrderInfo';

export default function Checkout() {
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='4xl' fontWeight='normal'>
				Оформлення замовлення
			</Heading>
			<Group justifyContent='space-between' align='flex-start' gap='4'>
				<Box as='section' w={{ base: '100%', lg: '75%' }}>
					<CheckoutSteps />
					<Box hideFrom='md'>{<OrderInfo />}</Box>
				</Box>
				<Box
					as='aside'
					w='25%'
					minW='304px'
					bg='bg.tertiary'
					rounded='sm'
					hideBelow='md'
					position='sticky'
					top='74px'
				>
					<OrderInfo />
				</Box>
			</Group>
		</Flex>
	);
}
