import { Link } from '@chakra-ui/react';

interface Props {
	href: string;
	children: string;
}

export default function SidebarLink({ href, children }: Props) {
	return (
		<Link display='inline-block' w='100%' href={href} _focus={{ outline: 'none' }}>
			{children}
		</Link>
	);
}
