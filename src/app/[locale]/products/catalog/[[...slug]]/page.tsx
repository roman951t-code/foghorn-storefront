import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Flex, Heading, Button, Card, HStack, Badge, Link } from '@chakra-ui/react';
import Image from 'next/image';

export default function Category() {
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs />
			<Heading as='h1' size='4xl' fontWeight='medium'>
				Меблі та техніка
			</Heading>
			<HStack flexWrap='wrap' gapY='8' gapX='4'>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
				<Card.Root
					variant='outline'
					size='sm'
					w='316px'
					overflow='hidden'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
					transition='all 0.25s ease-in-out'
					_hover={{
						borderColor: 'link',
						cursor: 'pointer',
					}}
				>
					<Card.Body gap='2'>
						<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
							Назва категорії
						</Card.Title>
						<HStack
							flexWrap='wrap'
							my='6'
							maxH='100px'
							overflowY='auto'
							justifyContent='center'
							gap={4}
						>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
							<Badge variant='outline' size='lg'>
								<Link
									href='#'
									textDecoration='underline'
									transition='all .15s ease-in-out'
									textDecorationColor='main'
									_hover={{ color: 'link' }}
									_focus={{ outline: 'none' }}
								>
									Підкатегорія
								</Link>
							</Badge>
						</HStack>
					</Card.Body>
					<Card.Footer justifyContent='center'>
						<Button
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
							w='100%'
						>
							Дивитись товари
						</Button>
					</Card.Footer>
					<Image
						height='180'
						width='200'
						src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
						alt='Green double couch with wooden legs'
					/>
				</Card.Root>
			</HStack>
		</Flex>
	);
}
