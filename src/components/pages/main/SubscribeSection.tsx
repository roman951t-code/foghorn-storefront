import { Heading, Flex, Input, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IoMailOutline } from 'react-icons/io5';

export default function SubscribeSection() {
	const genT = useTranslations('General');
	const authT = useTranslations('Auth');

	return (
		<Flex
			mt={20}
			mb={12}
			bg='bg.dark'
			p={4}
			rounded='md'
			boxShadow='sm'
			gap='4'
			flexWrap='wrap'
			alignItems='center'
			justifyContent={{ base: 'center', xl: 'space-between' }}
		>
			<Heading color='main' fontWeight='normal' size='lg' minWidth='260px'>
				{genT('subscribeInfo')}
			</Heading>

			<Flex
				gap='12px'
				alignItems='center'
				justifyContent={{ base: 'center', md: 'flex-end' }}
				minWidth='280px'
				flexWrap='wrap'
			>
				<Input
					rounded='md'
					type='email'
					placeholder={authT('email')}
					size='md'
					fontSize='md'
					variant='outline'
					minWidth='280px'
					maxWidth='340px'
					flex='1 1 0'
					transition='all .15s ease-in-out'
					_placeholder={{ fontSize: 'sm' }}
					_focus={{
						border: '1px solid',
						borderColor: 'main.secondary',
						outline: 'none',
					}}
				/>
				<Button
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
					minWidth='280px'
					maxWidth='340px'
					rounded='md'
					w={{ base: '100%', md: 'auto' }}
					flexShrink={0}
				>
					<IoMailOutline />
					{genT('subscribe')}
				</Button>
			</Flex>
		</Flex>
	);
}
