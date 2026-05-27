import { Button, type ButtonProps } from '@chakra-ui/react';
import { forwardRef, type ReactNode } from 'react';

type Props = ButtonProps & { children?: ReactNode };

export const PrimaryButton = forwardRef<HTMLButtonElement, Props>(function PrimaryButton(
	{ children, ...props },
	ref,
) {
	return (
		<Button
			ref={ref}
			color='black'
			colorPalette='gray'
			bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
			variant='solid'
			rounded='md'
			{...props}
		>
			{children}
		</Button>
	);
});

export const SecondaryButton = forwardRef<HTMLButtonElement, Props>(function SecondaryButton(
	{ children, ...props },
	ref,
) {
	return (
		<Button
			ref={ref}
			colorPalette='gray'
			color='main'
			bgColor={{ base: 'main' }}
			rounded='md'
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
});

export const TertiaryButton = forwardRef<HTMLButtonElement, Props>(function TertiaryButton(
	{ children, ...props },
	ref,
) {
	return (
		<Button
			ref={ref}
			colorPalette='gray'
			color='main'
			variant='outline'
			rounded='md'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border.button'
			{...props}
		>
			{children}
		</Button>
	);
});

export const AlertButton = forwardRef<HTMLButtonElement, Props>(function AlertButton(
	{ children, ...props },
	ref,
) {
	return (
		<Button
			ref={ref}
			colorPalette='red'
			variant={{
				base: 'subtle',
				_dark: 'solid',
			}}
			rounded='md'
			{...props}
		>
			{children}
		</Button>
	);
});
