'use client';

import type { ButtonProps, GroupProps, InputProps, StackProps } from '@chakra-ui/react';
import {
	Box,
	HStack,
	IconButton,
	Input,
	InputGroup,
	Stack,
	mergeRefs,
	useControllableState,
} from '@chakra-ui/react';
import * as React from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export interface PasswordVisibilityProps {
	defaultVisible?: boolean;
	visible?: boolean;
	onVisibleChange?: (visible: boolean) => void;
	visibilityIcon?: { on: React.ReactNode; off: React.ReactNode };
}

export interface PasswordInputProps extends InputProps, PasswordVisibilityProps {
	rootProps?: GroupProps;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	function PasswordInput(props, ref) {
		const {
			rootProps,
			defaultVisible,
			visible: visibleProp,
			onVisibleChange,
			visibilityIcon = { on: <LuEye />, off: <LuEyeOff /> },
			...rest
		} = props;

		const [visible, setVisible] = useControllableState({
			value: visibleProp,
			defaultValue: defaultVisible || false,
			onChange: onVisibleChange,
		});

		const inputRef = React.useRef<HTMLInputElement>(null);

		return (
			<InputGroup
				width='full'
				endElement={
					<VisibilityTrigger
						disabled={rest.disabled}
						onPointerDown={(e) => {
							if (rest.disabled) return;
							if (e.button !== 0) return;
							e.preventDefault();
						}}
						onClick={() => {
							if (rest.disabled) return;
							setVisible(!visible);
						}}
					>
						{visible ? visibilityIcon.off : visibilityIcon.on}
					</VisibilityTrigger>
				}
				{...rootProps}
			>
				<Input {...rest} ref={mergeRefs(ref, inputRef)} type={visible ? 'text' : 'password'} />
			</InputGroup>
		);
	}
);

const VisibilityTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
	function VisibilityTrigger(props, ref) {
		return (
			<IconButton
				ref={ref}
				me='-2'
				aspectRatio='square'
				size='sm'
				variant='ghost'
				rounded='md'
				height='calc(100% - {spacing.2})'
				aria-label='Toggle password visibility'
				{...props}
			/>
		);
	}
);

interface PasswordStrengthMeterProps extends StackProps {
	max?: number;
	value: number;
}

export const PasswordStrengthMeter = React.forwardRef<
	HTMLDivElement,
	PasswordStrengthMeterProps & { i18nData: any }
>(function PasswordStrengthMeter(props, ref) {
	const { max = 3, value, i18nData, ...rest } = props;

	const percent = (value / max) * 100;
	const { label, colorPalette } = getColorPalette(percent, i18nData);

	return (
		<Stack align='flex-end' gap='1' ref={ref} {...rest}>
			<HStack width='full' ref={ref} {...rest}>
				{Array.from({ length: max }).map((_, index) => (
					<Box
						key={index}
						height='1'
						flex='1'
						rounded='lg'
						data-selected={index < value ? '' : undefined}
						layerStyle='fill.subtle'
						colorPalette='gray'
						_selected={{
							colorPalette,
							layerStyle: 'fill.solid',
						}}
					/>
				))}
			</HStack>
			{label && (
				<HStack mt='1' fontSize={{ base: 'md', md: 'sm' }}>
					{label}
				</HStack>
			)}
		</Stack>
	);
});

function getColorPalette(percent: number, i18nData: { [key: string]: string }) {
	switch (true) {
		case percent < 33:
			return { label: i18nData.notSecure, colorPalette: 'red' };
		case percent < 66:
			return { label: i18nData.middleSecure, colorPalette: 'orange' };
		default:
			return { label: i18nData.secure, colorPalette: 'green' };
	}
}
