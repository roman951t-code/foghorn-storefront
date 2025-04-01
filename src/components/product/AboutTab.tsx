import ProductThumbsSlider from '@/components/reusable/slider/ProductThumbsSlider';
import { useTranslations } from 'next-intl';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import {
	Heading,
	Box,
	Group,
	IconButton,
	HStack,
	Link,
	Badge,
	VStack,
	Flex,
	Tag,
	Card,
	Stack,
	Separator,
	Stat,
	Button,
} from '@chakra-ui/react';
import { Rating } from '@/components/ui/rating';
import { HiCheck } from 'react-icons/hi';

export default function AboutTab() {
	const t = useTranslations('Products');

	return (
		<VStack gap='8'>
			<Group
				align={{ base: 'center', md: 'flex-start' }}
				flexDirection={{ base: 'column', md: 'row' }}
				gap='8'
			>
				<Box
					maxW={{ base: '90vw', md: '580px' }}
					w={{ base: '100%', md: '55%' }}
					bg='bg.tertiary'
					pb='4'
					rounded='md'
				>
					<ProductThumbsSlider />
				</Box>
				<VStack gap='2' alignItems='flex-start'>
					<Heading as='h1' size='3xl' fontWeight='medium'>
						Смартфон Samsung Galaxy S25 Ultra 12/512GB Titanium Whitesilver (SM-S938BZSGEUC)
					</Heading>
					<Flex w='100%' justifyContent='space-between' align-items='center'>
						<HStack>
							<Tag.Root variant='surface' size='lg' color='main' colorPalette='gray'>
								<Tag.Label>{t('productIsPresent')}</Tag.Label>
								<Tag.EndElement mt='-3' ml='2'>
									<HiCheck />
								</Tag.EndElement>
							</Tag.Root>
							<IconButton
								aria-label='Favourite'
								variant='ghost'
								rounded='full'
								colorPalette='red'
								color='colorPalette.400'
								transition='all 0.2s ease-in-out'
								_hover={{
									bg: 'colorPalette.400',
									color: 'main.lightOnly',
								}}
							>
								<FiHeart />
							</IconButton>
						</HStack>

						<Tag.Root variant='surface' size='lg' color='main' colorPalette='gray'>
							<Tag.Label>{t('productCode')}: 65719</Tag.Label>
						</Tag.Root>
					</Flex>
					<Stat.Root my='3'>
						<Flex flexWrap='wrap' alignItems='center' gap='4'>
							<Button
								size='lg'
								w='200px'
								bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
								color='black'
								variant='solid'
							>
								<FiShoppingCart /> {t('buy')}
							</Button>
							<Stat.ValueText w='124px' fontSize='3xl'>
								55 699 ₴
							</Stat.ValueText>
							<Badge colorPalette='gray' gap='0'>
								<Box
									as='span'
									color='main.disabled'
									fontSize='sm'
									textDecoration='line-through'
									marginLeft='8px'
								>
									59 709 ₴
									<Badge
										variant='solid'
										color='main.lightOnly'
										bg='main.tertiary'
										marginLeft='12px'
									>
										- 150₴
									</Badge>
								</Box>
							</Badge>
						</Flex>
					</Stat.Root>

					<HStack gap='4'>
						<Rating colorPalette='orange' readOnly size='xs' defaultValue={5} />
						<Link
							href='#'
							variant='underline'
							fontSize='sm'
							color='main'
							_focus={{ outline: 'none' }}
						>
							{t('feedback')} (3)
						</Link>
					</HStack>
					<Stack w='100%' gap='4' mt='6'>
						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> Секция плейсхолдер</Heading>
							</Card.Header>
							<Card.Body>
								Тут будуть общі характерістіки товара тіпа цвет або розмір. Тут будуть общі
								характерістіки товара тіпа цвет або розмір Тут будуть общі характерістіки товара
								тіпа цвет або розмір
							</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {t('payment')}</Heading>
							</Card.Header>
							<Card.Body>
								Картою онлайн, Оплата під час отримання товару, Оплата карткою у відділенні, Apple
								Pay, Google Pay, Безготівковими для юридичних осіб, Безготівковий для фізичних осіб
							</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {t('shipment')}</Heading>
							</Card.Header>
							<Card.Body>Доставка кур'єром Нової Пошти</Card.Body>
						</Card.Root>

						<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
							<Card.Header>
								<Heading size='md'> {t('guarantee')}</Heading>
							</Card.Header>
							<Card.Body>
								Законом про захист прав споживачів не передбачено повернення цього товару належної
								якості.
							</Card.Body>
						</Card.Root>
					</Stack>
				</VStack>
			</Group>
			<Separator borderColor='border.dark' />
			<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
				<Card.Header>
					<Heading size='lg'> {t('description')}</Heading>
				</Card.Header>
				<Card.Body>
					Pringles — торгова марка пшенично-картопляної закуски у формі параболоїда, яку виробляє
					компанія Kellogg's (до 5 квітня 2011 року — Procter&Gamble). Те, що виробляється під цим
					брендом, зазвичай називають чипсами. Але це не зовсім так, адже цю продукцію правильніше
					називати незграбним формулюванням «легка картопляна закуска». Річ у тім, що в складі
					Pringles картоплі лише 40%, решта — пшеничне борошно та крохмаль. Це швидше хрустке
					картопляне печиво, ніж чипси. До речі, саме цей факт довгий час давав змогу творцям
					уникати високих податків у Великобританії, де така продукція як чипси обкладається високим
					податком.
				</Card.Body>
			</Card.Root>
		</VStack>
	);
}
