'use client';

import { BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/chakra/breadcrumb';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import { LocaleNavLink } from './LocaleNavLink';
import { Button } from '@chakra-ui/react';
import { TbCategory2 } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

// Lightweight text-link crumbs (no per-crumb border/bg pill) — modern
// breadcrumbs read as a plain trail, not a row of buttons. Only the current
// (final) crumb gets real visual weight, via bold + the accent color.
function CustomBreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<LocaleNavLink
			href={href}
			wordBreak='break-word'
			fontSize={{ base: 'md', md: '16px' }}
			fontWeight='medium'
			color='main'
			textDecoration='none'
			transition='color .15s ease-in-out'
			_hover={{ color: 'link', cursor: 'pointer', textDecoration: 'underline' }}
			_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
		>
			{children}
		</LocaleNavLink>
	);
}

function BreadcrumbCurrentLink({ children }: { children: React.ReactNode }) {
	return (
		<BreadcrumbLink
			wordBreak='break-word'
			cursor='default'
			fontWeight='semibold'
			color='main'
			fontSize={{ base: 'md', md: '16px' }}
			textDecoration='none'
			_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
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
	const t = useTranslations('common');

	return (
		<BreadcrumbRoot
			variant='underline'
			size='lg'
			separator={
				<span style={{ fontSize: '1.4em', color: 'var(--chakra-colors-main-disabled)' }}>›</span>
			}
			separatorGap={2}
		>
			<CatalogBtn
				fullText={false}
				trigger={
					<Button
						size='sm'
						variant='outline'
						gap='1.5'
						borderWidth='0.5px'
						bg='bg.tertiary'
						boxShadow='none'
						px='3'
						borderColor='border'
						aria-label='Open catalog'
						height='30px'
						minW='auto'
						rounded='full'
						fontSize={{ base: 'md', md: '16px' }}
						fontWeight='medium'
						transition='all .15s ease-in-out'
						_hover={{
							color: 'link',
							bg: 'bgHover.promoCard',
							borderColor: 'main',
						}}
						_focusVisible={{
							outline: '2px solid',
							outlineColor: 'main.secondary',
							outlineOffset: '2px',
						}}
					>
						<TbCategory2 />
						{t('catalog')}
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
