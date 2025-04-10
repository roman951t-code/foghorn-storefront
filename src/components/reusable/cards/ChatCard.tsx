'use client';

import React, { useState } from 'react';
import {
	Text,
	Card,
	Tag,
	Separator,
	Flex,
	Accordion,
	Button as ChakraBtn,
	Icon,
} from '@chakra-ui/react';
import { MessageBox, Input, Button } from 'react-chat-elements';
import { IoMdAttach } from 'react-icons/io';
import 'react-chat-elements/dist/main.css';

const items = [
	{
		name: 'a',
		bio: '',
		image: 'https://i.pravatar.cc/150?u=a',
		topRated: false,
	},
];

interface Props {
	sendText: string;
	productNumText: string;
	inputPlaceholder: string;
}

export default function ChatCard({ sendText, productNumText, inputPlaceholder }: Props) {
	const [messages, setMessages] = useState([
		{
			position: 'left',
			type: 'text',
			text: 'Hello! How can I assist you?',
			title: 'Підтримка',
			date: new Date(),
		},
		{
			position: 'right',
			type: 'text',
			text: 'I have a question about a product.',
			title: 'Ви',
			date: new Date(),
		},
	]);

	const [newMessage, setNewMessage] = useState('');

	const sendMessage = () => {
		if (!newMessage.trim()) return;
		setMessages([
			...messages,
			{
				position: 'right',
				type: 'text',
				text: newMessage,
				title: 'You',
				date: new Date(),
			},
		]);
		setNewMessage('');
	};

	return (
		<Accordion.Root collapsible defaultValue={['a']}>
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
									<Tag.Label>№ {productNumText}: 65719</Tag.Label>
								</Tag.Root>
								<Text color='main.disabled' textStyle='sm'>
									12.02.2024
								</Text>
							</Flex>

							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>

						<Accordion.ItemContent>
							<Accordion.ItemBody p='0'>
								<Separator mt='6' mb='4' color='border.dark' />
								<Flex direction='column' border='1px solid' borderColor='border.dark' rounded='md'>
									<Flex h='60vh' direction='column' p='2' overflowY='auto' gap='4' mb='4'>
										{messages.map((msg, index) => (
											<MessageBox key={index} {...msg} />
										))}
									</Flex>
									<Flex px='4' pb='4' alignItems='center'>
										<ChakraBtn colorPalette='yellow' size='sm'>
											<Icon size='lg'>
												<IoMdAttach />
											</Icon>
										</ChakraBtn>

										<Input
											placeholder={`${inputPlaceholder}...`}
											value={newMessage}
											onChange={(e) => setNewMessage(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
										/>
										<Button text={sendText} onClick={sendMessage} />
									</Flex>
								</Flex>
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				</Card.Root>
			))}
		</Accordion.Root>
	);
}
