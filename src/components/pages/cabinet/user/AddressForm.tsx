import { Input, Field, Button, VStack } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';

interface Props {
	addressForm: UseFormReturn<
		{
			shipmentAddress: string;
		},
		unknown,
		{
			shipmentAddress: string;
		}
	>;
	error?: { message?: string };
	pending: boolean;
	i18nData: I18nData;
	onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function AddressForm({
	i18nData,
	error,
	pending,
	addressForm,
	onSubmitAction,
}: Props) {
	const fieldOrientation = { base: 'vertical' as const, md: 'horizontal' as const };

	return (
		<form onSubmit={onSubmitAction}>
			<Field.Root
				orientation={fieldOrientation}
				invalid={!!addressForm.formState.errors.shipmentAddress}
				gap='4'
				justifyContent='center'
			>
				<Field.Label maxH='20px'>{i18nData.shipmentAddress}</Field.Label>

				<VStack w='full' maxW='xl'>
					<Input
						{...addressForm.register('shipmentAddress')}
						variant='outline'
						size='md'
						maxW='xl'
					/>
					<Field.ErrorText alignSelf='flex-start'>
						{addressForm.formState.errors.shipmentAddress?.message?.toString() || error?.message}
					</Field.ErrorText>
				</VStack>

				<Button
					type='submit'
					loading={pending}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					variant='solid'
					size='md'
					rounded='md'
					mt={{ base: '2', sm: '0' }}
					w={{ base: 'full', sm: 'auto' }}
				>
					{i18nData.save}
				</Button>
			</Field.Root>
		</form>
	);
}
