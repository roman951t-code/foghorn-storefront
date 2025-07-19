import { Button } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	[key: string]: any;
}

export function PrimaryButton({ href, children, ...props }: Props) {
	return (
		<Button
			color='black'
			colorPalette='gray'
			bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
			variant='solid'
			{...props}
		>
			{children}
		</Button>
	);
}

export function SecondaryButton({ href, children, ...props }: Props) {
	return (
		<Button
			colorPalette='gray'
			color='main'
			bgColor={{ base: 'main' }}
			_hover={{
				bgColor: { base: 'bgHover', _dark: 'bg.subtle' },
			}}
			borderColor={{ base: 'main.accent', _dark: 'main.secondary' }}
			variant='outline'
			{...props}
		>
			{children}
		</Button>
	);
}

export function TertiaryButton({ href, children, ...props }: Props) {
	return (
		<Button
			colorPalette='gray'
			color='main'
			variant='outline'
			border='1px solid '
			borderColor='border'
			{...props}
		>
			{children}
		</Button>
	);
}

export function AlertButton({ href, children, ...props }: Props) {
	return (
		<Button
			colorPalette='red'
			variant={{
				base: 'subtle',
				_dark: 'solid',
			}}
			rounded='sm'
			{...props}
		>
			{children}
		</Button>
	);
}
