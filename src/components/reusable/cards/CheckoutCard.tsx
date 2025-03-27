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
} from '@chakra-ui/react';
import { StepperInput } from '@/components/ui/stepper-input';
import { FiTrash2 } from 'react-icons/fi';

const img1 = '/assets/images/temp/1.webp';

export function SidebarCheckoutCard() {
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
					<VStack alignItems='flex-start'>
						<Text color='main' fontSize='2xl'>
							55 699 ₴
						</Text>
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							59 709 ₴
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
								- 150₴
							</Badge>
						</Text>
						<StepperInput defaultValue='1' min={1} size='sm' />
					</VStack>
					<Image w='108px' height='auto' src={img1} alt='Product photo' objectFit='contain' />
				</Group>
			</Card.Footer>
			<Separator my='3' color='border.dark' />
		</Card.Root>
	);
}

export function FullCheckoutCard() {
	return (
		<Card.Root minWidth='200px' w='100%' border='none' bg='bg.tertiary'>
			<Flex align='center' justifyContent='space-between' direction={{ base: 'column', sm: 'row' }}>
				<Flex>
					<Image w='140px' height='auto' src={img1} alt='Product photo' objectFit='contain' />
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
						<Text color='main' fontSize='2xl'>
							55 699 ₴
						</Text>
						<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
							59 709 ₴{' '}
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
								- 150₴
							</Badge>
						</Text>
					</Flex>
				</Flex>
				<Flex
					direction={{ base: 'row', sm: 'column' }}
					justifyContent='space-between'
					alignItems={{ base: 'center', sm: 'flex-end' }}
					h={{ base: 'auto', sm: '140px' }}
					gap='4'
				>
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
					<StepperInput defaultValue='1' min={1} size='sm' />
				</Flex>
			</Flex>
			<Separator mt='6' mb='3' color='border.dark' />
		</Card.Root>
	);
}
