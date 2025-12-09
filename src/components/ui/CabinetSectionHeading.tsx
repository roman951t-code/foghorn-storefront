import { Heading, type HeadingProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type CabinetSectionHeadingProps = Omit<HeadingProps, 'title'> & { title: ReactNode };

export default function CabinetSectionHeading({ title, ...props }: CabinetSectionHeadingProps) {
	return (
		<Heading as='h2' size='2xl' fontWeight='medium' w='100%' mb='4' {...props}>
			{title}
		</Heading>
	);
}
