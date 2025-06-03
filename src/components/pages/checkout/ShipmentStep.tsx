import { Flex, Card, VStack, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { Radio, RadioGroup } from '@/components/ui/radio';

export default function ShipmentStep() {
	const t = useTranslations('Products');

	return (
		<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' textAlign='center' p='4'>
			<RadioGroup w='100%' defaultValue='1' colorPalette='gray'>
				<VStack gap='8' alignItems='space-between'>
					<Flex justifyContent='space-between' alignItems='center'>
						<Radio value='1'>Нова Пошта</Radio>
						<Text> 115 ₴</Text>
					</Flex>
					<Flex justifyContent='space-between' alignItems='center'>
						<Radio value='2'>УкрПошта</Radio>
						<Text> 115 ₴</Text>
					</Flex>
					<Flex justifyContent='space-between' alignItems='center'>
						<Radio value='3'>Meest</Radio>
						<Text> 115 ₴</Text>
					</Flex>
				</VStack>
			</RadioGroup>
		</Card.Root>
	);
}
