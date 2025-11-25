import { Card, HStack, Badge, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavButton, LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { useTranslations } from 'next-intl';

type CategoryCardProps = {
	title: string;
	imageUrl: string;
	products: { name: string; href: string }[];
	viewAllHref: string;
};

export default function CategoryCard({
	title,
	imageUrl,
	products,
	viewAllHref,
}: CategoryCardProps) {
	const t = useTranslations('products');

	return (
		<Card.Root
			variant='outline'
			maxW={{ base: '100%', xs: '316px' } as any}
			minW='240px'
			flex='1'
			size='sm'
			overflow='hidden'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: 'border',
				cursor: 'pointer',
			}}
		>
			<Card.Body gap='2'>
				<Card.Title fontWeight='medium' textStyle='2xl' textAlign='center'>
					{title}
				</Card.Title>

				<VStack my='6' overflowY='auto' justifyContent='center' gap={4}>
					{products.map((product, index) => (
						<Badge
							key={index}
							variant='outline'
							size='md'
							borderWidth='0.5px'
							bg='bg.tertiary'
							px='1.5'
							py='1'
							boxShadow='none'
							borderColor='border.light'
						>
							<LocaleNavLink
								href={product.href}
								wordBreak='break-word'
								transition='all .15s ease-in-out'
								textDecorationColor='main'
								color='main'
								_hover={{ color: 'link', cursor: 'pointer' }}
								_focus={{ outline: 'none' }}
							>
								{product.name}
							</LocaleNavLink>
						</Badge>
					))}
				</VStack>
			</Card.Body>

			<Card.Footer justifyContent='center'>
				<LocaleNavButton href={viewAllHref} mb='1'>
					{t('seeProducts')}
				</LocaleNavButton>
			</Card.Footer>

			<Image height={186} width={316} src={imageUrl} alt={title} style={{ width: '100%' }} />
		</Card.Root>
	);
}
