import { Tag } from '@chakra-ui/react';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<typeof Tag.Root>, 'children'> & {
	value: ReactNode;
	labelProps?: ComponentProps<typeof Tag.Label>;
};

export default function CountPill({ value, labelProps, ...props }: Props) {
	return (
		<Tag.Root
			variant='surface'
			borderWidth='0.5px'
			boxShadow='none'
			bg='bg.tertiary'
			borderColor='border'
			size='lg'
			color='main'
			py='1'
			{...props}
		>
			<Tag.Label fontSize='sm' fontWeight='semibold' {...labelProps}>
				{value}
			</Tag.Label>
		</Tag.Root>
	);
}
