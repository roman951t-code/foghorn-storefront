import {
	Text,
	Stack,
	Card,
	Badge,
	VStack,
	Tag,
	Separator,
	Highlight,
	Flex,
	HStack,
	Stat,
	Accordion,
	Box,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { BsArrowRepeat } from 'react-icons/bs';
import FeedbackModal from '@/components/product/FeedbackModal';
import Image from 'next/image';
import { LocaleNavLink } from '../links/LocaleNavLink';
import { PrimaryButton } from '../buttons/ActionButton';

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
	const authT = useTranslations('auth');
	const genT = useTranslations('common');
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');

	const i18nData = {
		name: authT('name'),
		email: authT('email'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
		advantages: prodT('advantages'),
		disAdvantages: prodT('disAdvantages'),
		feedbackMinLength: validT('feedbackMinLength'),
		feedbackMaxLength: validT('feedbackMaxLength'),
		invalidFormData: validT('invalidFormData'),
	};

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
								direction={{ base: 'column', xs: 'row' } as any}
								justifyContent='space-between'
								w='100%'
								gap='3'
							>
								<VStack gap='3' alignItems='flex-start' minW='140px'>
									<Stat.Root>
										<Stat.Label fontSize='sm'>{prodT('totalAmount')}</Stat.Label>
										<Stat.ValueText w='124px' fontSize='3xl'>
											55 699 ₴
										</Stat.ValueText>
									</Stat.Root>
									<Text textStyle='sm' fontWeight='normal'>
										<Highlight query='3' styles={{ fontWeight: 'bold' }}>
											{`${prodT('numOfProducts')}: 3`}
										</Highlight>
									</Text>
								</VStack>
								<HStack
									gap='1'
									display={{ base: 'none', lg: 'flex' }}
									maxW='440px'
									overflow='hidden'
								>
									<Image width={110} height={110} src={img1} alt='Product photo' />
									<Image width={110} height={110} src={img1} alt='Product photo' />
									<Image width={110} height={110} src={img2} alt='Product photo' />
									<Image width={110} height={110} src={img1} alt='Product photo' />
								</HStack>
								<VStack
									gap='4'
									mt={{ base: 4, sm: 0 }}
									justifyContent='center'
									alignItems={{ base: 'flex-start', sm: 'flex-end' }}
								>
									<Tag.Root
										variant='surface'
										borderWidth='0.5px'
										boxShadow='none'
										bg='bg.tertiary'
										borderColor='border.light'
										size='lg'
										color='main'
									>
										<Tag.Label textAlign='right'>№ {prodT('order')}: 65719</Tag.Label>
									</Tag.Root>
									<Text color='main' textStyle='sm' fontWeight='semibold'>
										{genT('from')} 12.02.2024
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
									<PrimaryButton>
										<BsArrowRepeat />
										{prodT('repeatOrder')}
									</PrimaryButton>

									{/* <FeedbackModal i18nData={i18nData} /> */}
								</Flex>
								<Stack gap='4' maxH='500px' overflowY='auto'>
									<Separator color='border.dark' />
									<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
										<Box ml='-8px' mr='1' mb={{ base: '12px', md: '0' }}>
											<Image width={120} height={110} src={img1} alt='Product photo' />
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
													marginLeft='12px'
												>
													-150 ₴
												</Badge>
											</Text>
										</Flex>
										<Stat.Root alignSelf='flex-end' color='main'>
											<Stat.ValueText textStyle='md' minW='42px'>
												{`x 2${genT('units')}`}
											</Stat.ValueText>
										</Stat.Root>
									</Flex>

									<Separator color='border.dark' />

									<Flex alignItems='center' direction={{ base: 'column', md: 'row' }} w='100%'>
										<Box ml='-8px' mr='1' mb={{ base: '12px', md: '0' }}>
											<Image width={120} height={110} src={img1} alt='Product photo' />
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
													marginLeft='12px'
												>
													-150 ₴
												</Badge>
											</Text>
										</Flex>
										<Stat.Root alignSelf='flex-end' color='main'>
											<Stat.ValueText textStyle='md' minW='42px'>
												{`x 2${genT('units')}`}
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
