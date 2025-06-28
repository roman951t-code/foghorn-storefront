import { Icon, RadioCard, Stack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { FaTruck } from 'react-icons/fa';

const items = [
	{ value: 'paypal', title: 'Нова Пошта', icon: <FaTruck /> },
	{ value: 'apple-pay', title: 'УкрПошта', icon: <FaTruck /> },
	{ value: 'card', title: 'Meest', icon: <FaTruck /> },
];

export default function ShipmentStep() {
	const t = useTranslations('Products');

	return (
		<RadioCard.Root
			orientation={{ base: 'vertical', xl: 'horizontal' }}
			align='center'
			defaultValue='paypal'
			mt='4'
		>
			<Stack direction={{ base: 'column', xs: 'row' }}>
				{items.map((item) => (
					<RadioCard.Item key={item.value} value={item.value} _hover={{ cursor: 'pointer' }}>
						<RadioCard.ItemHiddenInput />
						<RadioCard.ItemControl>
							<Icon fontSize='2xl' color='fg.muted'>
								{item.icon}
							</Icon>
							<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
						</RadioCard.ItemControl>
					</RadioCard.Item>
				))}
			</Stack>
		</RadioCard.Root>

		// <Card.Root size='sm' bg='bg.tertiary' borderColor='border.light' textAlign='center' p='4'>
		// 	<RadioGroup w='100%' defaultValue='1' colorPalette='gray'>
		// 		<VStack gap='8' alignItems='space-between'>
		// 			<Flex justifyContent='space-between' alignItems='center'>
		// 				<Radio value='1'>Нова Пошта</Radio>
		// 				<Text> 115 ₴</Text>
		// 			</Flex>
		// 			<Flex justifyContent='space-between' alignItems='center'>
		// 				<Radio value='2'>УкрПошта</Radio>
		// 				<Text> 115 ₴</Text>
		// 			</Flex>
		// 			<Flex justifyContent='space-between' alignItems='center'>
		// 				<Radio value='3'>Meest</Radio>
		// 				<Text> 115 ₴</Text>
		// 			</Flex>
		// 		</VStack>
		// 	</RadioGroup>
		// </Card.Root>
	);
}
