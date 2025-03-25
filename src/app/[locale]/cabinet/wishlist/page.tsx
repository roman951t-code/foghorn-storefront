import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export default function Wishlist() {
	const t = useTranslations('Sidebar');

	return (
		<VStack mt='4' w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('wishList')}
			</Heading>
		</VStack>
	);
}
