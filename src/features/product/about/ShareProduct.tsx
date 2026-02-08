'use client';
import {
	Clipboard,
	HoverCard,
	HStack,
	IconButton,
	Link as ChakraLink,
	Portal,
	Text,
	VStack,
} from '@chakra-ui/react';
import { FaShare } from 'react-icons/fa';
import { FaViber, FaTelegramPlane, FaFacebookSquare, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

export default function ShareProduct({ i18nData }: Props) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [fullUrl, setFullUrl] = useState('');
	const productTitle = (i18nData.productTitle ?? '').trim();
	const searchParamsString = searchParams.toString();

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const currentUrl = new URL(window.location.href);
			currentUrl.hash = '';
			setFullUrl(currentUrl.toString());
		}
	}, [pathname, searchParamsString]);

	const shareLinks = useMemo(() => {
		if (!fullUrl) {
			return {
				telegram: '',
				whatsapp: '',
				x: '',
				facebook: '',
				viber: '',
			};
		}

		const shareMessage = [productTitle, fullUrl].filter(Boolean).join(' ');
		const telegramParams = new URLSearchParams({ url: fullUrl });
		if (productTitle) {
			telegramParams.set('text', productTitle);
		}

		const xParams = new URLSearchParams({ url: fullUrl });
		if (productTitle) {
			xParams.set('text', productTitle);
		}

		return {
			telegram: `https://t.me/share/url?${telegramParams.toString()}`,
			whatsapp: `https://api.whatsapp.com/send?${new URLSearchParams({ text: shareMessage }).toString()}`,
			x: `https://x.com/intent/tweet?${xParams.toString()}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({
				u: fullUrl,
			}).toString()}`,
			viber: `viber://forward?text=${encodeURIComponent(shareMessage)}`,
		};
	}, [fullUrl, productTitle]);
	const isShareReady = fullUrl.length > 0;

	return (
		<HoverCard.Root size='sm' openDelay={300}>
			<HoverCard.Trigger asChild>
				<IconButton
					aria-label='Share'
					variant='ghost'
					rounded='md'
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

							<Clipboard.Root value={fullUrl} wordBreak='break-all' lineHeight='1.25'>
								<Clipboard.Trigger asChild>
									<ChakraLink as='span' color='blue.fg' textStyle='md'>
										<Clipboard.Indicator />
										<Clipboard.ValueText />
									</ChakraLink>
								</Clipboard.Trigger>
							</Clipboard.Root>

							<Text fontSize='sm' color='main'>
								{i18nData.pressToCopy}
							</Text>

							<HStack gap={3} m='auto'>
								<IconButton
									asChild
									aria-label='Share on Telegram'
									size='md'
									variant='ghost'
									color='main'
									rounded='md'
									aria-disabled={!isShareReady}
									pointerEvents={isShareReady ? 'auto' : 'none'}
									opacity={isShareReady ? 1 : 0.5}
								>
									<ChakraLink
										href={isShareReady ? shareLinks.telegram : undefined}
										target='_blank'
										rel='noopener noreferrer'
									>
										<FaTelegramPlane />
									</ChakraLink>
								</IconButton>
								<IconButton
									asChild
									aria-label='Share on WhatsApp'
									size='md'
									variant='ghost'
									color='main'
									rounded='md'
									aria-disabled={!isShareReady}
									pointerEvents={isShareReady ? 'auto' : 'none'}
									opacity={isShareReady ? 1 : 0.5}
								>
									<ChakraLink
										href={isShareReady ? shareLinks.whatsapp : undefined}
										target='_blank'
										rel='noopener noreferrer'
									>
										<FaWhatsapp />
									</ChakraLink>
								</IconButton>
								<IconButton
									asChild
									aria-label='Share on X'
									size='md'
									variant='ghost'
									color='main'
									rounded='md'
									aria-disabled={!isShareReady}
									pointerEvents={isShareReady ? 'auto' : 'none'}
									opacity={isShareReady ? 1 : 0.5}
								>
									<ChakraLink
										href={isShareReady ? shareLinks.x : undefined}
										target='_blank'
										rel='noopener noreferrer'
									>
										<FaXTwitter />
									</ChakraLink>
								</IconButton>
								<IconButton
									asChild
									aria-label='Share on Facebook'
									size='md'
									variant='ghost'
									color='main'
									rounded='md'
									aria-disabled={!isShareReady}
									pointerEvents={isShareReady ? 'auto' : 'none'}
									opacity={isShareReady ? 1 : 0.5}
								>
									<ChakraLink
										href={isShareReady ? shareLinks.facebook : undefined}
										target='_blank'
										rel='noopener noreferrer'
									>
										<FaFacebookSquare />
									</ChakraLink>
								</IconButton>
								<IconButton
									asChild
									aria-label='Share on Viber'
									size='md'
									variant='ghost'
									color='main'
									rounded='md'
									aria-disabled={!isShareReady}
									pointerEvents={isShareReady ? 'auto' : 'none'}
									opacity={isShareReady ? 1 : 0.5}
								>
									<ChakraLink
										href={isShareReady ? shareLinks.viber : undefined}
										target='_blank'
										rel='noopener noreferrer'
									>
										<FaViber />
									</ChakraLink>
								</IconButton>
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
