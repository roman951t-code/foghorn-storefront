import { Card, HStack, Badge } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavButton, LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { useTranslations } from 'next-intl';

type CategoryCardProps = {
	title: string;
	imageUrl: string;
	subcategories: { name: string; href: string }[];
	viewAllHref: string;
};

export default function CategoryCard({
	title,
	imageUrl,
	subcategories,
	viewAllHref,
}: CategoryCardProps) {
	const t = useTranslations('Products');
	return (
		<Card.Root
			variant='outline'
			minWidth='240px'
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
				<HStack flexWrap='wrap' my='6' overflowY='auto' justifyContent='center' gap={4}>
					{subcategories.map((sub, index) => (
						<Badge key={index} variant='outline' size='lg'>
							<LocaleNavLink href={sub.href} textDecoration='underline'>
								{sub.name}
							</LocaleNavLink>
						</Badge>
					))}
				</HStack>
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
