import React from 'react';
import {
	Text,
	Stack,
	Card,
	Badge,
	Link,
	HStack,
	Image,
	Separator,
	Flex,
	IconButton,
	Heading,
	Box,
	Accordion,
} from '@chakra-ui/react';
import FeedbackModal from '@/components/product/FeedbackModal';
import { Rating } from '@/components/ui/rating';
import { FiTrash2 } from 'react-icons/fi';

const img1 = '/assets/images/temp/1.webp';

interface Props {
	feedback?: string;
}

const items = [
	{
		name: 'Alex',
		bio: '',
		image: 'https://i.pravatar.cc/150?u=a',
		topRated: false,
	},
];

export default function FullCheckoutCard({ feedback }: Props) {
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
						{feedback ? (
							<Accordion.ItemTrigger w='100%' p='0'>
								<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
									<Image
										w='110px'
										height='auto'
										src={img1}
										alt='Product photo'
										objectFit='contain'
										ml='-3'
										mb={{ base: '3', md: 0 }}
									/>
									<Flex direction='column' gap={2} w='100%'>
										<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
											<Link
												href='#'
												textDecoration='underline'
												transition='all .15s ease-in-out'
												textDecorationColor='main'
												color='main'
												_hover={{ color: 'main.accent' }}
												_focus={{ outline: 'none' }}
											>
												Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
											</Link>
										</Card.Title>
										<Text color='main' fontSize='xl'>
											55 699 ₴
										</Text>
										<HStack justifyContent='space-between'>
											<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
												59 709 ₴
												<Badge
													variant='solid'
													color='main.lightOnly'
													bg='main.tertiary'
													marginLeft='12px'
												>
													- 150₴
												</Badge>
											</Text>
										</HStack>
									</Flex>
								</Flex>
								<Accordion.ItemIndicator />
							</Accordion.ItemTrigger>
						) : (
							<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
								<Image
									w='110px'
									height='auto'
									src={img1}
									alt='Product photo'
									objectFit='contain'
									mb={{ base: '3', md: 0 }}
								/>
								<Flex direction='column' gap={2} w='100%'>
									<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
										<Link
											href='#'
											textDecoration='underline'
											transition='all .15s ease-in-out'
											textDecorationColor='main'
											color='main'
											_hover={{ color: 'main.accent' }}
											_focus={{ outline: 'none' }}
										>
											Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
										</Link>
									</Card.Title>
									<Text color='main' fontSize='xl'>
										55 699 ₴
										<Text
											as='span'
											color='main.disabled'
											fontSize='sm'
											textDecoration='line-through'
											marginLeft='8px'
										>
											59 709 ₴
										</Text>
										<Badge
											variant='solid'
											color='main.lightOnly'
											bg='main.tertiary'
											marginLeft='8px'
										>
											-150 ₴
										</Badge>
									</Text>
								</Flex>
								<HStack
									justifyContent={{ base: 'center', md: 'flex-end' }}
									mt={{ base: '3', md: 0 }}
								>
									<FeedbackModal />
								</HStack>
							</Flex>
						)}

						{feedback && (
							<Accordion.ItemContent>
								<Accordion.ItemBody p='0'>
									<Flex justifyContent='space-between' mt='6'>
										<Stack>
											<Heading size='md'> Roman Onyshchenko</Heading>
											<Rating colorPalette='orange' readOnly size='xs' defaultValue={5} />
										</Stack>

										<IconButton
											aria-label='Cart'
											variant='ghost'
											rounded='full'
											colorPalette='gray'
											color='colorPalette.500'
											transition='all 0.2s ease-in-out'
											_hover={{
												bg: 'colorPalette.500',
												color: 'main.lightOnly',
											}}
										>
											<FiTrash2 />
										</IconButton>
									</Flex>
									<Separator mt='4' color='border.dark' />
									<Card.Body color='main' px='0' pb='0'>
										Купляв не сам збирав гроші певний час кинув на карту батькам. Вони купили
										гарантія є все як треба. Переживав на рахунок того може щось не так з ним бо
										багато міфів про те що яблука продають брак і тд. Але на зараз як вже другий
										тиждень користуюсь 16 максом задоволений ніяких непорозумінь немає все чудово
										працює. Загалом рекомендую
									</Card.Body>
								</Accordion.ItemBody>
							</Accordion.ItemContent>
						)}
					</Accordion.Item>
				</Card.Root>
			))}
		</Accordion.Root>
	);
}
