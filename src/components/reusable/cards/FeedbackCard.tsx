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
} from '@chakra-ui/react';
import FeedbackModal from '@/components/product/FeedbackModal';
import { Rating } from '@/components/ui/rating';
import { FiTrash2 } from 'react-icons/fi';

const img1 = '/assets/images/temp/1.webp';

interface Props {
	feedback?: string;
}

export default function FullCheckoutCard({ feedback }: Props) {
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			p='4'
			mb='4'
			pl={{ base: 4, sm: 0 }}
		>
			<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }}>
				<Image w='110px' height='auto' src={img1} alt='Product photo' objectFit='contain' />
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
							59 709 ₴{' '}
							<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
								- 150₴
							</Badge>
						</Text>
						{!feedback && <FeedbackModal />}
					</HStack>
				</Flex>
			</Flex>

			{feedback && (
				<>
					<Separator mt='4' color='border.dark' />

					<Card.Root w='100%' bg='bg.tertiary' border='none'>
						<Card.Header>
							<Flex justifyContent='space-between'>
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
						</Card.Header>
						<Separator mt='4' color='border.dark' />
						<Card.Body color='main'>
							Купляв не сам збирав гроші певний час кинув на карту батькам. Вони купили гарантія є
							все як треба. Переживав на рахунок того може щось не так з ним бо багато міфів про те
							що яблука продають брак і тд. Але на зараз як вже другий тиждень користуюсь 16 максом
							задоволений ніяких непорозумінь немає все чудово працює. Загалом рекомендую
						</Card.Body>
					</Card.Root>
				</>
			)}
		</Card.Root>
	);
}
