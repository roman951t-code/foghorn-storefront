import {
	Text,
	Stack,
	Card,
	Badge,
	Separator,
	Flex,
	IconButton,
	Heading,
	Box,
	Accordion,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import FeedbackModal from '@/features/product/FeedbackModal';
import { FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Rating } from '@/components/ui/chakra/rating';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { VscFeedback } from 'react-icons/vsc';

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
				<Accordion.ItemTrigger w='100%' p='0' cursor='pointer'>
					<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} w='100%'>
						<Box ml='-8px' mr='1'>
							<Image
								width={110}
								height={110}
								style={{ minWidth: '100px' }}
								src={img1}
								alt='Product photo'
							/>
						</Box>
						<Flex direction='column' gap={2} w='100%'>
							<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
								<LocaleNavLink
									href='/products/1/1'
									textDecoration='underline'
									fontSize='md'
									color='main'
								>
									Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
								</LocaleNavLink>
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
					<Accordion.ItemBody p='0' pt='4'>
						<Flex justifyContent='space-between' mt='6'>
							<Stack>
								<Heading size='md'> Roman Onyshchenko</Heading>
								<Rating
									id='feedback-card-rating'
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									readOnly
									size='xs'
									defaultValue={5}
								/>
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
							Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							has been the industry's standard dummy text ever since the 1500s, when an unknown
							printer took a galley of type and scrambled it to make a type specimen book. It has
							survived not only five centuries, but also the leap into electronic typesetting,
							remaining essentially unchanged. It was popularised in the 1960s with the release of
							Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
							publishing software like Aldus PageMaker including versions of Lorem Ipsum.
						</Card.Body>
					</Accordion.ItemBody>
				</Accordion.ItemContent>
			</Accordion.Item>
		</Card.Root>
	);
}

function CardWithoutFeedback({ item }: { item: (typeof items)[0] }) {
	const authT = useTranslations('auth');
	const genT = useTranslations('common');
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');

	const i18nData = {
		name: authT('name'),
		email: authT('email'),
		rate: prodT('rate'),
		advantages: prodT('advantages'),
		disAdvantages: prodT('disAdvantages'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		invalidFormData: validT('invalidFormData'),
		send: genT('send'),
		feedbackMinLength: validT('feedbackMinLength'),
		feedbackMaxLength: validT('feedbackMaxLength'),
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
				<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} w='100%'>
					<Box ml='-8px' mr='1' mb={{ base: '12px', sm: '0', md: '12px', lg: '0' }}>
						<Image
							width={110}
							height={110}
							style={{ minWidth: '100px' }}
							src={img1}
							alt='Product photo'
						/>
					</Box>
					<Stack direction='column' gap={2} w='100%'>
						<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
							<LocaleNavLink
								href='/products/1/1'
								textDecoration='underline'
								fontSize='md'
								color='main'
							>
								Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
							</LocaleNavLink>
						</Card.Title>
						<Stack direction={{ base: 'column', sm: 'row' }} justifyContent='space-between'>
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
						</Stack>
					</Stack>
					<Flex flex={1} justifyContent='flex-end' hideBelow='md'>
						<FeedbackModal i18nData={i18nData} />
						<SecondaryButton>
							<VscFeedback /> {i18nData.leaveFeedback}
						</SecondaryButton>
					</Flex>
				</Flex>
				<Flex flex={1} justifyContent='flex-end' hideFrom='md'>
					<FeedbackModal i18nData={i18nData} />
					<SecondaryButton>
						<VscFeedback /> {i18nData.leaveFeedback}
					</SecondaryButton>
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
