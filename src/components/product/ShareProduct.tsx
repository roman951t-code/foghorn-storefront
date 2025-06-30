import { Clipboard, HoverCard, IconButton, Link, Portal, Text, VStack } from '@chakra-ui/react';
import { FaShare } from 'react-icons/fa';

interface Props {
	copyText: string;
	shareText: string;
}

export default function ShareProduct({ copyText, shareText }: Props) {
	return (
		<HoverCard.Root size='sm'>
			<HoverCard.Trigger asChild>
				<IconButton
					aria-label='Share'
					variant='ghost'
					rounded='full'
					colorPalette='gray'
					color='main.disabled'
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
							<Text fontSize='md'>{shareText}</Text>
							<Clipboard.Root value='https://chakra-ui.com'>
								<Clipboard.Trigger asChild>
									<Link as='span' color='blue.fg' textStyle='md'>
										<Clipboard.Indicator />
										<Clipboard.ValueText />
									</Link>
								</Clipboard.Trigger>
							</Clipboard.Root>
							<Text fontSize='sm' color='main.disabled'>
								{copyText}
							</Text>
						</VStack>
					</HoverCard.Content>
				</HoverCard.Positioner>
			</Portal>
		</HoverCard.Root>
	);
}
