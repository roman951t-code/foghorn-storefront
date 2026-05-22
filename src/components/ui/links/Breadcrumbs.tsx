'use client';

import { BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/chakra/breadcrumb';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import { LocaleNavLink } from './LocaleNavLink';
import { Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

function CustomBreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<LocaleNavLink
			href={href}
			wordBreak='break-word'
			fontSize={{ base: 'md', md: '15px' }}
			textDecoration='none'
			display='inline-flex'
			alignItems='center'
			h='30px'
			px='3'
			py='1'
			rounded='lg'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			transition='all .15s ease-in-out'
			_hover={{
				color: 'link',
				cursor: 'pointer',
				bg: 'bgHover.promoCard',
				borderColor: 'border.button',
			}}
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
			fontWeight='medium'
			fontSize={{ base: 'md', md: '15px' }}
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
						borderWidth='0.5px'
						bg='bg.tertiary'
						boxShadow='none'
						px='3'
						borderColor='border'
						aria-label='Open catalog'
						height='30px'
						minW='auto'
						rounded='md'
						fontSize={{ base: 'md', md: '15px' }}
						fontWeight='medium'
						_hover={{
							color: 'link',
							bg: 'bgHover.promoCard',
							borderColor: 'border.button',
						}}
						_focusVisible={{
							outline: '2px solid',
							outlineColor: 'main.secondary',
							outlineOffset: '2px',
						}}
					>
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
