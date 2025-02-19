import { Flex, Card, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { Radio, RadioGroup } from '@/components/ui/radio';

export default function PaymentStep() {
	const t = useTranslations('Products');

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' textAlign='center' p='4'>
			<RadioGroup w='100%' variant='outline' defaultValue='1' colorPalette='orange'>
				<VStack gap='8' alignItems='space-between'>
					<Radio value='1'>Готівкою</Radio>
					<Radio value='2'>Онлайн банкінг</Radio>
					<Radio value='3'>Безготівковий розрахунок</Radio>
				</VStack>
			</RadioGroup>
		</Card.Root>
	);
}
