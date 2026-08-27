import { Flex, IconButton, Link } from '@chakra-ui/react';
import { AiFillInstagram } from 'react-icons/ai';
import { FaViber, FaTelegramPlane, FaFacebookSquare } from 'react-icons/fa';
import { GrMail } from 'react-icons/gr';

interface Props {
	hideBelow?: string;
	i18nData: {
		facebook: string;
		instagram: string;
		viber: string;
		telegram: string;
		email: string;
	};
}

// Plain props, not useTranslations — this renders from both a Server
// Component (Footer) and a Client Component (Sidebar), and Footer sits
// outside <NextIntlClientProvider> in [locale]/layout.tsx, so a client-side
// translation hook here would throw for that call site.
export default function MediaContacts({ hideBelow, i18nData }: Props) {
	return (
		<Flex align='center' hideBelow={hideBelow} gap='4'>
			<Link href='https://www.facebook.com' target='_blank' rel='noopener noreferrer'>
				<IconButton
					aria-label={i18nData.facebook}
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='md'
					colorPalette='blue'
					bg={{ _hover: 'colorPalette.500' }}
				>
					<FaFacebookSquare />
				</IconButton>
			</Link>
			<Link href='https://www.instagram.com' target='_blank' rel='noopener noreferrer'>
				<IconButton
					aria-label={i18nData.instagram}
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='md'
					colorPalette='pink'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<AiFillInstagram />
				</IconButton>
			</Link>
			<Link href='https://www.viber.com' target='_blank' rel='noopener noreferrer'>
				<IconButton
					aria-label={i18nData.viber}
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='md'
					colorPalette='purple'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<FaViber />
				</IconButton>
			</Link>
			<Link href='https://www.telegram.org' target='_blank' rel='noopener noreferrer'>
				<IconButton
					aria-label={i18nData.telegram}
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='md'
					colorPalette='blue'
					bg={{ _hover: 'colorPalette.400' }}
				>
					<FaTelegramPlane />
				</IconButton>
			</Link>
			{/* Was pointing at facebook.com (copy-paste from the link above) instead
			    of a mailto: — the icon looked right but didn't send an email at
			    all. support@example.com matches the placeholder contact address
			    already used in privacyPolicy.ts; swap both together once there's a
			    real support inbox. */}
			<Link href='mailto:roman951t@gmail.com'>
				<IconButton
					aria-label={i18nData.email}
					size='md'
					variant='ghost'
					color='main.lightOnly'
					rounded='md'
					colorPalette='accent'
					bg={{ _hover: 'colorPalette.500' }}
				>
					<GrMail />
				</IconButton>
			</Link>
		</Flex>
	);
}
