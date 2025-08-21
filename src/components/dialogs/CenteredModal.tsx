'use client';

import React, { ReactNode, JSX } from 'react';
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	DialogTrigger,
	DialogHeader,
	DialogTitle,
} from '@/components/reusable/chakra/dialog';

type ConditionalValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

interface Props {
	trigger?: ReactNode;
	children: JSX.Element;
	title: string;
	open?: boolean;
	closeOnInteractOutside?: boolean;
	size?: ConditionalValue<'lg' | 'sm' | 'md' | 'xl' | 'xs' | 'cover' | 'full' | undefined>;
	setIsOpen: any;
}

export default function CenteredModal({
	trigger,
	children,
	title,
	size = 'lg',
	closeOnInteractOutside = false,
	setIsOpen,
	open,
}: Props) {
	return (
		<DialogRoot
			open={open}
			onOpenChange={(e) => setIsOpen(e.open)}
			unmountOnExit
			lazyMount
			placement='center'
			motionPreset='slide-in-bottom'
			size={size}
			scrollBehavior='inside'
			closeOnInteractOutside={closeOnInteractOutside}
		>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent bg='bg.tertiary' minWidth='350px'>
				<DialogHeader>
					<DialogTitle
						fontSize='xl'
						w='100%'
						fontWeight='medium'
						borderBottom='1px solid'
						borderColor='border'
						pb={2}
					>
						{title}
					</DialogTitle>
				</DialogHeader>
				<DialogBody>{children}</DialogBody>
				<DialogCloseTrigger _focus={{ outline: 'none' }} borderColor={{ _hover: 'border' }} />
			</DialogContent>
		</DialogRoot>
	);
}
