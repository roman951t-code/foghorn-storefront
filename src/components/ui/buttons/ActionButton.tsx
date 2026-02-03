import { Button, type ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type Props = ButtonProps & { children?: ReactNode };

export function PrimaryButton({ children, ...props }: Props) {
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

export function SecondaryButton({ children, ...props }: Props) {
	return (
		<Button
			colorPalette='gray'
			color='main'
			bgColor={{ base: 'main' }}
			_hover={{
				color: { base: 'black', _dark: 'white' },
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

export function TertiaryButton({ children, ...props }: Props) {
	return (
		<Button
			colorPalette='gray'
			color='main'
			variant='outline'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border.button'
			{...props}
		>
			{children}
		</Button>
	);
}

export function AlertButton({ children, ...props }: Props) {
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
