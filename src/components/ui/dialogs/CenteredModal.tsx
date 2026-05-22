'use client';

import { useMemo } from 'react';
import type { ReactNode, JSX } from 'react';
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	DialogTrigger,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/chakra/dialog';

type ConditionalValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

interface Props {
	trigger?: ReactNode;
	children: JSX.Element;
	title: string;
	open?: boolean;
	closeOnInteractOutside?: boolean;
	size?: ConditionalValue<'lg' | 'sm' | 'md' | 'xl' | 'xs' | 'cover' | 'full' | undefined>;
	setIsOpen: (isOpen: boolean) => void;
	dialogId?: string;
}

export default function CenteredModal({
	trigger,
	children,
	title,
	size = 'lg',
	closeOnInteractOutside = true,
	setIsOpen,
	open,
	dialogId,
}: Props) {
	const baseId = useMemo(
		() =>
			dialogId ||
			`dialog-${title
				.toString()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '')}`,
		[dialogId, title],
	);

	const idBase = baseId || 'dialog';

	const ids = useMemo(
		() => ({
			trigger: `${idBase}-trigger`,
			content: `${idBase}-content`,
			title: `${idBase}-title`,
			description: `${idBase}-description`,
		}),
		[idBase],
	);

	return (
		<DialogRoot
			id={idBase}
			ids={ids}
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
						whiteSpace='pre-line'
						borderBottomWidth='0.5px'
						borderBottomStyle='solid'
						borderColor='border'
						pb={2}
					>
						{title}
					</DialogTitle>
				</DialogHeader>
				<DialogBody>{children}</DialogBody>
				<DialogCloseTrigger
					_focusVisible={{
						outline: '2px solid',
						outlineColor: 'main.secondary',
						outlineOffset: '2px',
					}}
					borderColor={{ _hover: 'border' }}
				/>
			</DialogContent>
		</DialogRoot>
	);
}
