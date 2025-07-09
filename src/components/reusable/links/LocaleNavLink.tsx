import { Button, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import type { ReactNode } from 'react';

interface Props {
	href: string;
	children?: ReactNode;
	[key: string]: any;
}

export function LocaleNavLink({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<ChakraLink
				as='span'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'link' }}
				_focus={{ outline: 'none' }}
				{...props}
			>
				{children}
			</ChakraLink>
		</Link>
	);
}

export function LocaleNavButton({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<Button
				color='black'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				variant='solid'
				_hover={{
					bg: 'bgHover.button',
				}}
				mb='1'
				{...props}
			>
				{children}
			</Button>
		</Link>
	);
}
