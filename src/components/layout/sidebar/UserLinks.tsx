import { Link, LinkProps, Stack, Text, Icon } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { LuMessageSquareMore } from 'react-icons/lu';
import { GrChatOption } from 'react-icons/gr';
import { useTranslations } from 'next-intl';

interface CustomLinkProps extends LinkProps {
	children: ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({ children, ...props }) => {
	return (
		<Link
			display='flex'
			alignItems='center'
			variant='plain'
			_hover={{ color: 'orange.400' }}
			_focus={{ outline: 'none' }}
			gap={2}
			{...props}
		>
			{children}
		</Link>
	);
};

export default function UserLinks() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6}>
			<CustomLink href='#'>
				<Icon size='md'>
					<AiOutlineUnorderedList />
				</Icon>
				<Text>{t('myOrders')}</Text>
			</CustomLink>
			<CustomLink href='#'>
				<Icon size='md'>
					<FiShoppingCart />
				</Icon>
				<Text>{t('cart')}</Text>
			</CustomLink>
			<CustomLink href='#'>
				<Icon size='md'>
					<LuMessageSquareMore />
				</Icon>
				<Text>{t('myFeedback')}</Text>
			</CustomLink>
			<CustomLink href='#'>
				<Icon size='md'>
					<FiHeart />
				</Icon>
				<Text>{t('wishList')}</Text>
			</CustomLink>
			<CustomLink href='#'>
				<Icon size='md'>
					<FiEye />
				</Icon>
				<Text>{t('reviewedProducts')}</Text>
			</CustomLink>
			<CustomLink href='#'>
				<Icon size='md'>
					<GrChatOption />
				</Icon>
				<Text>{t('chat')}</Text>
			</CustomLink>
		</Stack>
	);
}
