import React from 'react';
import {
	Text,
	Stack,
	Card,
	Badge,
	Link,
	HStack,
	Tag,
	Separator,
	Flex,
	Heading,
	Accordion,
} from '@chakra-ui/react';
import { Rating } from '@/components/ui/rating';

const img1 = '/assets/images/temp/1.webp';

const items = [
	{
		name: 'Alex',
		bio: '',
		image: 'https://i.pravatar.cc/150?u=a',
		topRated: false,
	},
];

export default function OrderCard() {
	return (
		<Accordion.Root collapsible defaultValue={['b']} multiple>
			{items.map((item, index) => (
				<Card.Root
					minWidth='200px'
					w='100%'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					p='4'
					mb='4'
					key={index}
				>
					<Accordion.Item value={item.name} borderBottom='none'>
						<Accordion.ItemTrigger w='100%' p='0'>
							<Flex justifyContent='space-between' w='100%'>
								<Tag.Root variant='surface' size='lg' color='main' colorPalette='gray'>
									<Tag.Label>Номер замовлення: 65719</Tag.Label>
								</Tag.Root>
								<Badge colorPalette='green'>Success</Badge>
								<Text color='main.disabled' textStyle='sm'>
									12.02.2024
								</Text>
							</Flex>

							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>

						<Accordion.ItemContent>
							<Accordion.ItemBody p='0'>
								<Separator mt='6' mb='4' color='border.dark' />
								Тут деталі замовлення
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				</Card.Root>
			))}
		</Accordion.Root>
	);
}
