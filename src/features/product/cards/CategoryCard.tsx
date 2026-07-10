import { Card, Wrap, Box } from '@chakra-ui/react';
import { LocaleNavButton, LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import CategoryCardImage from './CategoryCardImage';

type CategoryCardProps = {
	title: string;
	imageUrl: string;
	products: { name: string; href: string }[];
	viewAllHref: string;
	seeProductsLabel: string;
	imagePriority?: boolean;
};

export default function CategoryCard({
	title,
	imageUrl,
	products,
	viewAllHref,
	seeProductsLabel,
	imagePriority = false,
}: CategoryCardProps) {
	return (
		<Card.Root
			w='full'
			h='full'
			borderWidth='1px'
			borderStyle='solid'
			borderColor='border'
			rounded='xl'
			overflow='hidden'
			bg='bg.tertiary'
			transition='box-shadow 0.2s ease-in-out'
			_hover={{
				boxShadow: {
					// Same mode-aware glow as ProductCard's hover treatment, kept
					// consistent app-wide.
					base: '0 1px 22px rgba(0, 0, 0, 0.22)',
					_dark: '0 1px 26px rgba(177, 175, 179, 0.26)',
				},
			}}
		>
			<Box position='relative' w='full' aspectRatio={316 / 186}>
				<CategoryCardImage src={imageUrl} alt={title} priority={imagePriority} />
			</Box>

			<Card.Body gap='3' p={{ base: 4, cardSm: 5 }}>
				<Card.Title as='h2' fontWeight='semibold' textStyle='xl' color='main'>
					{title}
				</Card.Title>

				{products.length > 0 && (
					<Wrap gap='2'>
						{products.map((product, index) => (
							<LocaleNavLink
								key={index}
								href={product.href}
								fontSize='sm'
								fontWeight='medium'
								bg='bgHover.promoCard'
								color='main'
								px='2.5'
								py='1'
								rounded='full'
								textWrap='wrap'
								wordBreak='break-word'
								_hover={{ color: 'link', bg: 'bgHover.DEFAULT' }}
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'main.secondary',
									outlineOffset: '2px',
								}}
							>
								{product.name}
							</LocaleNavLink>
						))}
					</Wrap>
				)}

				<LocaleNavButton href={viewAllHref} mt='2' w='full' aria-label={`${seeProductsLabel} ${title}`}>
					{seeProductsLabel}
				</LocaleNavButton>
			</Card.Body>
		</Card.Root>
	);
}
