import React from 'react';
import {
	Text,
	Stack,
	Card,
	Badge,
	Link,
	VStack,
	Tag,
	Button,
	Separator,
	Highlight,
	Flex,
	Image,
	HStack,
	Stat,
	Accordion,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

const img1 = '/assets/images/temp/1.webp';
const img2 = '/assets/images/temp/2.webp';

const items = [
	{
		name: 'Alex',
		bio: '',
		image: 'https://i.pravatar.cc/150?u=a',
		topRated: false,
	},
];

export default function OrderCard() {
	const t = useTranslations('Products');
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
							<Flex
								direction={{ base: 'column', sm: 'row' }}
								justifyContent='space-between'
								w='100%'
							>
								<VStack gap='3' alignItems='flex-start'>
									<Stat.Root>
										<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
										<Stat.ValueText w='124px' fontSize='3xl'>
											55 699 ₴
										</Stat.ValueText>
									</Stat.Root>
									<Text textStyle='sm' fontWeight='normal'>
										<Highlight query='3' styles={{ fontWeight: 'semibold' }}>
											Кількість товарів: 3
										</Highlight>
									</Text>
								</VStack>
								<HStack gap='1' display={{ base: 'none', lg: 'flex' }}>
									<Image w='100px' h='auto' src={img1} alt='Product photo' objectFit='contain' />
									<Image w='100px' h='auto' src={img2} alt='Product photo' objectFit='contain' />
									<Image w='100px' h='auto' src={img1} alt='Product photo' objectFit='contain' />
								</HStack>
								<VStack
									gap='3'
									mt={{ base: 4, sm: 0 }}
									justifyContent='center'
									alignItems={{ base: 'flex-start', sm: 'flex-end' }}
								>
									<Tag.Root variant='surface' size='lg' color='main' colorPalette='gray'>
										<Tag.Label>№ замовлення: 65719</Tag.Label>
									</Tag.Root>
									<Text color='main' textStyle='sm'>
										від 12.02.2024
									</Text>
								</VStack>
							</Flex>

							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>

						<Accordion.ItemContent>
							<Accordion.ItemBody p='0'>
								<Separator color='border.dark' my='6' />
								<Flex
									justifyContent='space-between'
									w='100%'
									mb='6'
									gap={{ base: '4', sm: '0' }}
									direction={{ base: 'column', sm: 'row' }}
								>
									<Button
										colorPalette='gray'
										color='main'
										variant='outline'
										border='1px solid '
										borderColor='border'
									>
										Залишити відгук
									</Button>
									<Button
										bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
										color='main'
										variant='solid'
									>
										Повторити замовлення
									</Button>
								</Flex>
								<Stack gap='4' maxH='500px' overflowY='auto'>
									<Separator color='border.dark' />
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
										<Stat.Root alignSelf='flex-end' color='main'>
											<Stat.ValueText textStyle='md' minW='42px'>
												x 2шт
											</Stat.ValueText>
										</Stat.Root>
									</Flex>
									<Separator color='border.dark' />
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
										<Stat.Root alignSelf='flex-end' color='main'>
											<Stat.ValueText textStyle='md' minW='42px'>
												x 2шт
											</Stat.ValueText>
										</Stat.Root>
									</Flex>
								</Stack>
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				</Card.Root>
			))}
		</Accordion.Root>
	);
}
