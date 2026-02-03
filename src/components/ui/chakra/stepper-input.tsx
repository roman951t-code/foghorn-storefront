import { HStack, IconButton, NumberInput } from '@chakra-ui/react';
import * as React from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

export interface StepperInputProps extends NumberInput.RootProps {
	label?: React.ReactNode;
}

export const StepperInput = React.forwardRef<HTMLDivElement, StepperInputProps>(
	function StepperInput(props, ref) {
		const { label, 'aria-label': ariaLabel, ...rest } = props;
		const resolvedLabel = ariaLabel ?? (typeof label === 'string' ? label : 'Quantity');
		return (
			<NumberInput.Root aria-label={resolvedLabel} {...rest} unstyled ref={ref}>
				{label && <NumberInput.Label>{label}</NumberInput.Label>}
				<HStack
					gap='1'
					px='1'
					py='1'
					rounded='full'
					borderWidth='1px'
					borderColor='border'
					bg={{ base: 'gray.100', _dark: '#161620' }}
				>
					<DecrementTrigger />
					<NumberInput.ValueText textAlign='center' fontSize='sm' fontWeight='bold' minW='3ch' />
					<IncrementTrigger />
				</HStack>
			</NumberInput.Root>
		);
	}
);

const DecrementTrigger = React.forwardRef<HTMLButtonElement, NumberInput.DecrementTriggerProps>(
	function DecrementTrigger(props, ref) {
		return (
			<NumberInput.DecrementTrigger {...props} asChild ref={ref}>
				<IconButton
					variant='ghost'
					size='xs'
					rounded='full'
					aria-label='Decrease value'
					_hover={{ bg: 'bgHover.promoCard' }}
				>
					<LuMinus />
				</IconButton>
			</NumberInput.DecrementTrigger>
		);
	}
);

const IncrementTrigger = React.forwardRef<HTMLButtonElement, NumberInput.IncrementTriggerProps>(
	function IncrementTrigger(props, ref) {
		return (
			<NumberInput.IncrementTrigger {...props} asChild ref={ref}>
				<IconButton
					variant='ghost'
					size='xs'
					rounded='full'
					aria-label='Increase value'
					_hover={{ bg: 'bgHover.promoCard' }}
				>
					<LuPlus />
				</IconButton>
			</NumberInput.IncrementTrigger>
		);
	}
);
