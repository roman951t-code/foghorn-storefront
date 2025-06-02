import React from 'react';
import {
	Text,
	VStack,
	Card,
	Badge,
	Link,
	Separator,
	Flex,
	Group,
	Stat,
	LinkBox,
	LinkOverlay,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const img1 = '/assets/images/temp/1.webp';

export function SidebarCheckoutCard() {
	const t = useTranslations('General');
	return (
		<Card.Root gap={4} py={1} border='none' bg='bg.tertiary'>
			<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
				<Link
					href='#'
					color='main'
					variant='underline'
					_focus={{ outline: 'none' }}
					transition='all .15s ease-in-out'
					textDecorationColor='main'
					_hover={{ color: 'link' }}
				>
					Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
				</Link>
			</Card.Title>
			<Group p='0'>
				<Image
					style={{ marginLeft: '-8px' }}
					width='108'
					height='108'
					src={img1}
					alt='Product photo'
				/>

				<VStack alignItems='flex-start'>
					<Text color='main' fontSize='2xl'>
						55 699 ₴
					</Text>
					<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
						59 709 ₴
						<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='10px'>
							- 150₴
						</Badge>
					</Text>
					<Stat.Root>
						<Stat.ValueText textStyle='md' minW='42px'>
							{`x 2${t('units')}`}
						</Stat.ValueText>
					</Stat.Root>
				</VStack>
			</Group>

			<Separator my='1' color='border.dark' />
		</Card.Root>
	);
}

export function FullCheckoutCard() {
	const t = useTranslations('General');
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='none'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
		>
			<LinkBox>
				<Flex
					align='center'
					justifyContent='space-between'
					direction={{ base: 'column', sm: 'row' }}
					p={2}
					pl={0}
				>
					<Image
						style={{ marginLeft: '-8px' }}
						width='120'
						height='120'
						src={img1}
						alt='Product photo'
					/>
					<Flex direction='column' gap={3} p={2}>
						<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
							<LinkOverlay asChild>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'main.accent' }}
									_focus={{ outline: 'none' }}
								>
									Велотренажер Gymtek XB1400 до 150 кг магнітний домашній синій
								</Link>
							</LinkOverlay>
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
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
								-150 ₴
							</Badge>
						</Text>
					</Flex>
					<Stat.Root alignSelf='flex-end' color='main'>
						<Stat.ValueText textStyle='md' minW='42px'>
							{`x 2${t('units')}`}
						</Stat.ValueText>
					</Stat.Root>
				</Flex>
			</LinkBox>

			<Separator mt='4' mb='3' color='border.dark' />
		</Card.Root>
	);
}
