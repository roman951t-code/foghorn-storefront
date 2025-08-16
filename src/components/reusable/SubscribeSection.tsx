'use client';

import { useSession } from '@/components/providers/SessionProvider';
import { PrimaryButton } from '@/components/reusable/buttons/ActionButton';
import { Heading, Flex, Input } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IoMailOutline } from 'react-icons/io5';

export default function SubscribeSection() {
	const genT = useTranslations('General');
	const authT = useTranslations('Auth');

	const { session } = useSession();

	if (!session?.session) {
		return null;
	}

	return (
		<Flex
			mt={24}
			mb={12}
			bg='bg.dark'
			p={4}
			rounded='md'
			boxShadow='sm'
			gapX='8'
			gapY='4'
			flexWrap='wrap'
			alignItems='center'
			justifyContent={{ base: 'center', '2xl': 'space-between' }}
		>
			<Heading color='main' fontWeight='normal' size='lg' minW='260px'>
				{genT('subscribeInfo')}
			</Heading>

			<Flex
				gap='4'
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
					colorPalette={{ base: 'orange', _dark: 'yellow' }}
					_placeholder={{ fontSize: 'sm' }}
					_focus={{
						outline: 'none',
					}}
				/>
				<PrimaryButton
					minWidth='280px'
					maxWidth='340px'
					w={{ base: '100%', md: 'auto' }}
					flexShrink={0}
				>
					<IoMailOutline />
					{genT('subscribe')}
				</PrimaryButton>
			</Flex>
		</Flex>
	);
}
