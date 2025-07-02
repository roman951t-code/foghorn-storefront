'use client';
import {
	Clipboard,
	HoverCard,
	HStack,
	IconButton,
	Link as Chakralink,
	Portal,
	Text,
	VStack,
} from '@chakra-ui/react';
import { FaShare } from 'react-icons/fa';
import { Link } from '@/i18n/routing';
import { FaViber, FaTelegramPlane, FaFacebookSquare, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function ShareProduct({ i18nData }: Props) {
	const pathname = usePathname();
	const [fullUrl, setFullUrl] = useState('');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const origin = window.location.origin;
			setFullUrl(origin + pathname);
		}
	}, [pathname]);

	const encodedUrl = encodeURIComponent(fullUrl);
	const encodedTitle = encodeURIComponent(i18nData.productTitle ?? '');

	const telegram = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
	const whatsapp = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
	const twitter = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
	const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
	const viber = `viber://forward?text=${encodedTitle}%20${encodedUrl}`;

	return (
		<HoverCard.Root size='sm' openDelay={300}>
			<HoverCard.Trigger asChild>
				<IconButton
					aria-label='Share'
					variant='ghost'
					rounded='full'
					colorPalette='gray'
					color='main'
					transition='all 0.2s ease-in-out'
					_hover={{
						bg: 'colorPalette.600',
						color: 'main.lightOnly',
					}}
				>
					<FaShare />
				</IconButton>
			</HoverCard.Trigger>
			<Portal>
				<HoverCard.Positioner>
					<HoverCard.Content>
						<HoverCard.Arrow />
						<VStack gap='2' alignItems='flex-start'>
							<Text fontSize='md'>{i18nData.shareProductText}</Text>

							<Clipboard.Root value={fullUrl}>
								<Clipboard.Trigger asChild>
									<Chakralink as='span' color='blue.fg' textStyle='md'>
										<Clipboard.Indicator />
										<Clipboard.ValueText />
									</Chakralink>
								</Clipboard.Trigger>
							</Clipboard.Root>

							<Text fontSize='sm' color='main'>
								{i18nData.pressToCopy}
							</Text>

							<HStack gap={3} m='auto'>
								<Link href={telegram} target='_blank'>
									<IconButton
										aria-label='Share on Telegram'
										size='md'
										variant='ghost'
										color='main'
										rounded='full'
									>
										<FaTelegramPlane />
									</IconButton>
								</Link>
								<Link href={whatsapp} target='_blank'>
									<IconButton
										aria-label='Share on WhatsApp'
										size='md'
										variant='ghost'
										color='main'
										rounded='full'
									>
										<FaWhatsapp />
									</IconButton>
								</Link>
								<Link href={twitter} target='_blank'>
									<IconButton
										aria-label='Share on X'
										size='md'
										variant='ghost'
										color='main'
										rounded='full'
									>
										<FaXTwitter />
									</IconButton>
								</Link>
								<Link href={facebook} target='_blank'>
									<IconButton
										aria-label='Share on Facebook'
										size='md'
										variant='ghost'
										color='main'
										rounded='full'
									>
										<FaFacebookSquare />
									</IconButton>
								</Link>
								<Link href={viber} target='_blank'>
									<IconButton
										aria-label='Share on Viber'
										size='md'
										variant='ghost'
										color='main'
										rounded='full'
									>
										<FaViber />
									</IconButton>
								</Link>
							</HStack>

							<Text fontSize='sm' color='main'>
								{i18nData.shareSocial}
							</Text>
						</VStack>
					</HoverCard.Content>
				</HoverCard.Positioner>
			</Portal>
		</HoverCard.Root>
	);
}
