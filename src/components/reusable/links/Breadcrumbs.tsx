import { BreadcrumbLink, BreadcrumbRoot } from '@/components/reusable/chakra/breadcrumb';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import { LocaleNavLink } from './LocaleNavLink';
import { Badge } from '@chakra-ui/react';

interface Props {
	category?: string;
	subcategory?: string;
	product?: string;
}

function CustomBreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Badge variant='outline' size='md'>
			<LocaleNavLink
				href={href}
				wordBreak='break-word'
				fontSize='15px'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				color='main'
				_hover={{ color: 'link', cursor: 'pointer' }}
				_focus={{ outline: 'none' }}
			>
				{children}
			</LocaleNavLink>
		</Badge>
	);
}

function BreadcrumbCurrentLink({ children }: { children: React.ReactNode }) {
	return (
		<BreadcrumbLink
			wordBreak='break-word'
			color='main'
			cursor='default'
			fontWeight='medium'
			fontSize='15px'
			textDecoration='none'
			_focus={{ outline: 'none' }}
		>
			{children}
		</BreadcrumbLink>
	);
}

export default function Breadcrumbs({ category, subcategory, product }: Props) {
	return (
		<BreadcrumbRoot variant='underline' size='lg'>
			<CatalogBtn
				fullText={false}
				trigger={
					<Badge variant='outline' size='md'>
						<BreadcrumbLink
							wordBreak='break-word'
							fontSize='15px'
							fontWeight='medium'
							color='main'
							textDecorationColor='main'
							_hover={{ color: 'link', cursor: 'pointer' }}
							_focus={{ outline: 'none' }}
						>
							Каталог
						</BreadcrumbLink>
					</Badge>
				}
			/>

			{category &&
				(!subcategory && !product ? (
					<BreadcrumbCurrentLink>{category}</BreadcrumbCurrentLink>
				) : (
					<CustomBreadcrumbLink href={`/products/${category}`}>{category}</CustomBreadcrumbLink>
				))}

			{subcategory &&
				(!product ? (
					<BreadcrumbCurrentLink>{subcategory}</BreadcrumbCurrentLink>
				) : (
					<CustomBreadcrumbLink href={`/products/${category}/${subcategory}`}>
						{subcategory}
					</CustomBreadcrumbLink>
				))}

			{product && <BreadcrumbCurrentLink>{product}</BreadcrumbCurrentLink>}
		</BreadcrumbRoot>
	);
}
