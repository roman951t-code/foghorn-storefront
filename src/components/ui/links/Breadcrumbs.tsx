import { BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/chakra/breadcrumb';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import { LocaleNavLink } from './LocaleNavLink';
import { Badge, Button } from '@chakra-ui/react';

interface Props {
	category?: string;
	subcategory?: string;
	product?: string;
}

function CustomBreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Badge
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
			color='fg'
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

interface Props {
	categorySlug?: string;
	subcategorySlug?: string;
	categoryName?: string;
	subcategoryName?: string;
	productSlug?: string;
	productName?: string;
}

export default function Breadcrumbs({
	categorySlug,
	subcategorySlug,
	categoryName,
	subcategoryName,
	productSlug,
	productName,
}: Props) {
	return (
		<BreadcrumbRoot variant='underline' size='lg'>
			<CatalogBtn
				fullText={false}
				trigger={
					<Button
						size='sm'
						variant='outline'
						borderWidth='0.5px'
						bg='bg.tertiary'
						boxShadow='none'
						px='1.5'
						py='1'
						borderColor='border.light'
						aria-label='Open catalog'
						height='32px'
						minW='auto'
					>
						<BreadcrumbLink
							wordBreak='break-word'
							fontSize='15px'
							transition='all .15s ease-in-out'
							textDecoration='none'
							color='main'
							_hover={{
								color: 'link',
								cursor: 'pointer',
								textDecoration: 'underline',
								textDecorationColor: 'main',
							}}
							_focus={{ outline: 'none' }}
						>
							Каталог
						</BreadcrumbLink>
					</Button>
				}
			/>

			{categorySlug &&
				(!subcategorySlug && !productSlug ? (
					<BreadcrumbCurrentLink>{categoryName}</BreadcrumbCurrentLink>
				) : (
					<CustomBreadcrumbLink href={`/products/${categorySlug}`}>
						{categoryName}
					</CustomBreadcrumbLink>
				))}

			{subcategorySlug &&
				(!productSlug ? (
					<BreadcrumbCurrentLink>{subcategoryName}</BreadcrumbCurrentLink>
				) : (
					<CustomBreadcrumbLink href={`/products/${categorySlug}/${subcategorySlug}`}>
						{subcategoryName}
					</CustomBreadcrumbLink>
				))}

			{productSlug && <BreadcrumbCurrentLink>{productName}</BreadcrumbCurrentLink>}
		</BreadcrumbRoot>
	);
}
