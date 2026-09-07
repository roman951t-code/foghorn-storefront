'use client';

import type { ButtonProps, GroupProps, InputProps } from '@chakra-ui/react';
import { IconButton, Input, InputGroup, mergeRefs, useControllableState } from '@chakra-ui/react';
import * as React from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

interface PasswordVisibilityProps {
	defaultVisible?: boolean;
	visible?: boolean;
	onVisibleChange?: (visible: boolean) => void;
	visibilityIcon?: { on: React.ReactNode; off: React.ReactNode };
}

interface PasswordInputProps extends InputProps, PasswordVisibilityProps {
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
