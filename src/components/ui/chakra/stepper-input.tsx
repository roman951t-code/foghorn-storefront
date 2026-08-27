import { HStack, IconButton, NumberInput } from '@chakra-ui/react';
import * as React from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

interface StepperInputProps extends NumberInput.RootProps {
	label?: React.ReactNode;
}

export const StepperInput = React.forwardRef<HTMLDivElement, StepperInputProps>(
	function StepperInput(props, ref) {
		const { label, 'aria-label': ariaLabel, ...rest } = props;
		const resolvedLabel = ariaLabel ?? (typeof label === 'string' ? label : 'Quantity');
		return (
			<NumberInput.Root aria-label={resolvedLabel} {...rest} unstyled ref={ref}>
				{label && <NumberInput.Label>{label}</NumberInput.Label>}
				<HStack gap='1' px='0.5' py='0.5' rounded='lg' borderWidth='0.5px' borderColor='border'>
					<DecrementTrigger />
					<NumberInput.ValueText
						textAlign='center'
						fontSize={{ base: 'md', md: 'sm' }}
						fontWeight='semibold'
						minW='3ch'
					/>
					<IncrementTrigger />
				</HStack>
			</NumberInput.Root>
		);
	},
);

const DecrementTrigger = React.forwardRef<HTMLButtonElement, NumberInput.DecrementTriggerProps>(
	function DecrementTrigger(props, ref) {
		return (
			<NumberInput.DecrementTrigger {...props} asChild ref={ref}>
				<IconButton
					variant='ghost'
					size='xs'
					rounded='md'
					aria-label='Decrease value'
					_hover={{ bg: 'bgHover.promoCard' }}
				>
					<LuMinus />
				</IconButton>
			</NumberInput.DecrementTrigger>
		);
	},
);

const IncrementTrigger = React.forwardRef<HTMLButtonElement, NumberInput.IncrementTriggerProps>(
	function IncrementTrigger(props, ref) {
		return (
			<NumberInput.IncrementTrigger {...props} asChild ref={ref}>
				<IconButton
					variant='ghost'
					size='xs'
					rounded='md'
					aria-label='Increase value'
					_hover={{ bg: 'bgHover.promoCard' }}
				>
					<LuPlus />
				</IconButton>
			</NumberInput.IncrementTrigger>
		);
	},
);
