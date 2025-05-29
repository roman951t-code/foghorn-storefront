import React from 'react';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import { IconButton, Text, Flex, Card, Badge, Group, Link } from '@chakra-ui/react';
import { StepperInput } from '@/components/ui/stepper-input';
import Image from 'next/image';

const img1 = '/assets/images/temp/1.webp';

export default function CartOrderCard() {
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
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
					<Image
						objectFit='contain'
						src={img1}
						alt='Product photo'
						width='130'
						height='20'
						style={{ objectFit: 'contain' }}
					/>
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
					w={{ base: '100%', sm: 'auto' }}
				>
					<Group mt={{ base: '3', sm: 0 }}>
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
					</Group>
					<StepperInput defaultValue='1' min={1} size='xs' />
				</Flex>
			</Flex>
		</Card.Root>
	);
}
