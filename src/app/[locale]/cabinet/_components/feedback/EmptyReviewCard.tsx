'use client';

import { Accordion, Badge, Card, Flex, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { useMemo } from 'react';
import FeedbackModal from '@/features/product/FeedbackModal';
import type { Review, SubcategoryProduct } from '@/types/product';
import { buildProductImages, toPreviewImage } from '@/utils/productImages';

type Props = {
	product: SubcategoryProduct & { fullSlug: string };
	price: { current: number; previous: number | null; savings: number | null };
	onAddAction: (review: Review) => void;
};

export function EmptyReviewCard({ product, price, onAddAction }: Props) {
	const productHref = useMemo(() => `/products/${product.fullSlug}`, [product.fullSlug]);
	const previewImage = toPreviewImage(
		buildProductImages(product.imageUrl, 1)[0] || '/assets/images/temp/1.webp'
	);

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Accordion.Item value={product.id} borderBottom='none'>
				<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} w='100%'>
					<LocaleNavLink href={productHref} mr='4'>
						<Image
							src={previewImage}
							alt={product.name ?? ''}
							width={130}
							height={130}
							style={{ objectFit: 'contain', borderRadius: '6px' }}
						/>
					</LocaleNavLink>
					<Stack direction='column' gap={2} w='100%'>
						<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
							<LocaleNavLink
								href={`/products/${product.fullSlug}`}
								textDecoration='underline'
								fontSize='md'
								color='main'
							>
								{product.name}
							</LocaleNavLink>
						</Card.Title>
						<Stack direction={{ base: 'column', sm: 'row' }} justifyContent='space-between'>
							<Text color='main' fontSize='xl' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
								{price.current} ₴
								{price.previous && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='8px'
									>
										{price.previous} ₴
									</Text>
								)}
								{price.savings && (
									<Badge
										variant='solid'
										color='main.lightOnly'
										bg='main.tertiary'
										marginLeft='12px'
									>
										- {price.savings} ₴
									</Badge>
								)}
							</Text>
						</Stack>
					</Stack>
					<Flex flex={1} alignSelf='flex-end' hideBelow='md'>
						<FeedbackModal productId={product.id} onSuccess={onAddAction} />
					</Flex>
				</Flex>
				<Flex flex={1} justifyContent='flex-end' hideFrom='md'>
					<FeedbackModal productId={product.id} onSuccess={onAddAction} />
				</Flex>
			</Accordion.Item>
		</Card.Root>
	);
}
