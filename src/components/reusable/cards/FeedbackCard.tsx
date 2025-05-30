import React from 'react';
import {
	Text,
	Stack,
	Card,
	Badge,
	Link,
	Separator,
	Flex,
	IconButton,
	Heading,
	Box,
	Accordion,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import FeedbackModal from '@/components/product/FeedbackModal';
import { Rating } from '@/components/ui/rating';
import { FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';

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

function CardWithFeedback({ item }: { item: (typeof items)[0] }) {
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Accordion.Item value={item.name} borderBottom='none'>
				<Accordion.ItemTrigger w='100%' p='0'>
					<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
						<Box ml='-8px' mr='1' mb={{ base: '12px', md: '0' }}>
							<Image width={120} height={110} src={img1} alt='Product photo' />
						</Box>
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
							<Text color='main' fontSize='xl' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
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
								<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
									-150 ₴
								</Badge>
							</Text>
						</Flex>
					</Flex>
					<Accordion.ItemIndicator />
				</Accordion.ItemTrigger>

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
								color='main.disabled'
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
							Купляв не сам збирав гроші певний час кинув на карту батькам. Вони купили гарантія є
							все як треба. Переживав на рахунок того може щось не так з ним бо багато міфів про те
							що яблука продають брак і тд. Але на зараз як вже другий тиждень користуюсь 16 максом
							задоволений ніяких непорозумінь немає все чудово працює. Загалом рекомендую
						</Card.Body>
					</Accordion.ItemBody>
				</Accordion.ItemContent>
			</Accordion.Item>
		</Card.Root>
	);
}

function CardWithoutFeedback({ item }: { item: (typeof items)[0] }) {
	const authT = useTranslations('Auth');
	const genT = useTranslations('General');
	const prodT = useTranslations('Products');

	const i18nData = {
		name: authT('name'),
		email: authT('email'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
	};

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Accordion.Item value={item.name} borderBottom='none'>
				<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
					<Box ml='-8px' mr='1' mb={{ base: '12px', md: '0' }}>
						<Image width={120} height={110} src={img1} alt='Product photo' />
					</Box>

					<Stack direction='column' gap={2} w='100%'>
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
						<Stack direction={{ base: 'column', sm: 'row' }} justifyContent='space-between' mt={2}>
							<Text color='main' fontSize='xl' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
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
								<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
									-150 ₴
								</Badge>
							</Text>
							<FeedbackModal i18nData={i18nData} />
						</Stack>
					</Stack>
				</Flex>
			</Accordion.Item>
		</Card.Root>
	);
}

export default function FullCheckoutCard({ feedback }: Props) {
	return (
		<Accordion.Root collapsible defaultValue={['b']} multiple>
			{items.map((item, index) =>
				feedback ? (
					<CardWithFeedback key={index} item={item} />
				) : (
					<CardWithoutFeedback key={index} item={item} />
				)
			)}
		</Accordion.Root>
	);
}
