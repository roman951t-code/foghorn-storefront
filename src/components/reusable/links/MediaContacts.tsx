import { Flex, IconButton, Link } from '@chakra-ui/react';
import { AiFillInstagram } from 'react-icons/ai';
import { FaViber, FaTelegramPlane, FaFacebookSquare } from 'react-icons/fa';
import { GrMail } from 'react-icons/gr';

interface Props {
	hideBelow?: string;
}

export default function MediaContacts({ hideBelow }: Props) {
	return (
		<Flex align='center' hideBelow={hideBelow} gap='4'>
			<Link href='https://www.facebook.com'>
				<IconButton
					aria-label='Account'
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='full'
					colorPalette='blue'
					bg={{ _hover: 'colorPalette.500' }}
				>
					<FaFacebookSquare />
				</IconButton>
			</Link>
			<Link href='https://www.instagram.com'>
				<IconButton
					aria-label='Account'
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='full'
					colorPalette='pink'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<AiFillInstagram />
				</IconButton>
			</Link>
			<Link href='https://www.viber.com'>
				<IconButton
					aria-label='Account'
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='full'
					colorPalette='purple'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<FaViber />
				</IconButton>
			</Link>
			<Link href='https://www.telegram.org'>
				<IconButton
					aria-label='Account'
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='full'
					colorPalette='blue'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<FaTelegramPlane />
				</IconButton>
			</Link>
			<Link href='https://www.facebook.com'>
				<IconButton
					aria-label='Account'
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='full'
					colorPalette='accent'
					bg={{ _hover: 'colorPalette.500' }}
				>
					<GrMail />
				</IconButton>
			</Link>
		</Flex>
	);
}
