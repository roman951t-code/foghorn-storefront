import { Heading, Flex, Input, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export default function SubscribeSection() {
	const genT = useTranslations('General');
	const authT = useTranslations('Auth');

	return (
		<Flex mt={20} mb={12} bg='bg.dark' p={4} rounded='md' align='center' wrap='wrap' gap='12px'>
			<Heading
				flex='1'
				color='main.lightOnly'
				fontWeight='normal'
				size='xl'
				minWidth='260px'
				marginX='20px'
			>
				{genT('subscribeInfo')}
			</Heading>
			<Flex wrap='wrap' gap='12px' flex='1.5'>
				<Input
					rounded='md'
					placeholder={authT('email')}
					size='md'
					variant='outline'
					fontSize='sm'
					minWidth='280px'
					maxWidth='340px'
					bg='bg'
					transition='all .2s ease-in-out'
					_placeholder={{ fontSize: 'sm' }}
					_focus={{
						border: '2px solid',
						borderColor: 'main.secondary',
						outline: 'none',
					}}
				/>
				<Button
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
					rounded='md'
					w='100%'
					minWidth='280px'
					maxWidth='340px'
				>
					{genT('subscribe')}
				</Button>
			</Flex>
		</Flex>
	);
}
