import { Card, Badge, VStack, Flex, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavButton, LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
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
			maxW={{ base: '100%', sm: '316px' }}
			minW='270px'
			flex='1'
			size='sm'
			overflow='hidden'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: 'border',
			}}
		>
			<Card.Body gap='2'>
				<Card.Title as='h2' fontWeight='medium' textStyle='2xl' textAlign='center'>
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
							border='none'
						>
							<LocaleNavLink
								href={product.href}
								fontSize='md'
								fontWeight='normal'
								textWrap='wrap'
								wordBreak='break-word'
								textDecorationColor='main'
								color='main'
								variant='underline'
								_hover={{ color: 'link' }}
								_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
							>
								{product.name}
							</LocaleNavLink>
						</Badge>
					))}
				</VStack>
			</Card.Body>

			<Flex justifyContent='center'>
				<LocaleNavButton
					href={viewAllHref}
					minW='200px'
					aria-label={`${t('seeProducts')} ${title}`}
				>
					{t('seeProducts')}
				</LocaleNavButton>
			</Flex>

			<Box
				position='relative'
				w='full'
				aspectRatio={316 / 186}
				mt='28px'
				overflow='hidden'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
			>
				<Image
					src={imageUrl}
					alt={title}
					fill
					sizes='(min-width: 30em) 316px, 100vw'
					loading='lazy'
					style={{ objectFit: 'cover' }}
				/>
			</Box>
		</Card.Root>
	);
}
