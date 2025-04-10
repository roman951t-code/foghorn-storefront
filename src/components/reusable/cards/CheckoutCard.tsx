import React from 'react';
import {
	Text,
	VStack,
	Card,
	Badge,
	Link,
	Image,
	Separator,
	Flex,
	IconButton,
	Group,
	Stat,
} from '@chakra-ui/react';
import { StepperInput } from '@/components/ui/stepper-input';
import { FiTrash2 } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

const img1 = '/assets/images/temp/1.webp';

export function SidebarCheckoutCard() {
	const t = useTranslations('General');
	return (
		<Card.Root gap={2} p={2} w='100%' border='none' bg='bg.tertiary'>
			<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
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
			</Card.Title>
			<Card.Footer p='0'>
				<Group justifyContent='space-between' w='100%'>
					<Image w='108px' height='auto' src={img1} alt='Product photo' objectFit='contain' />

					<VStack alignItems='flex-start'>
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
						<Stat.Root alignSelf='flex-end' color='main'>
							<Stat.ValueText textStyle='md' minW='42px'>
								{`x 2${t('units')}`}
							</Stat.ValueText>
						</Stat.Root>
					</VStack>
				</Group>
			</Card.Footer>
			<Separator my='3' color='border.dark' />
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
			<Flex
				align='center'
				justifyContent='space-between'
				direction={{ base: 'column', sm: 'row' }}
				p={3}
				pl={{ base: 3, sm: 0 }}
			>
				<Flex>
					<Image w='130px' height='auto' src={img1} alt='Product photo' objectFit='contain' />
					<Flex direction='column' gap={3} p={2}>
						<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
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
				</Flex>
				<Flex
					direction={{ base: 'row', sm: 'column' }}
					justifyContent='space-between'
					alignItems={{ base: 'center', sm: 'flex-end' }}
					h={{ base: 'auto', sm: '140px' }}
					w={{ base: '100%', sm: 'auto' }}
				>
					<IconButton
						aria-label='Trash'
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
					<Stat.Root alignSelf='flex-start' color='main'>
						<Stat.ValueText textStyle='md' minW='42px'>
							{`x 2${t('units')}`}
						</Stat.ValueText>
					</Stat.Root>
				</Flex>
			</Flex>
			<Separator mt='4' mb='3' color='border.dark' />{' '}
		</Card.Root>
	);
}
