'use client';

import {
	Accordion,
	Badge,
	Card,
	DataList,
	Flex,
	Icon,
	IconButton,
	Separator,
	Stack,
	Text,
} from '@chakra-ui/react';
import Image from 'next/image';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { useMemo } from 'react';
import { Rating } from '@/components/ui/chakra/rating';
import DateWithLocale from '@/components/ui/DateWithLocale';
import { FiTrash2 } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import type { Review, SubcategoryProduct } from '@/types/product';
import {
	buildProductImages,
	resolveProductPrimaryImage,
	toPreviewImage,
} from '@/utils/productImages';
import { formatUsdPrice } from '@/utils/priceFormatting';

type Props = {
	product: SubcategoryProduct & { fullSlug: string };
	review: Review;
	price: { current: number; previous: number | null; savings: number | null };
	pending: boolean;
	onRemoveAction: () => void;
};

export function ReviewCard({ product, review, price, pending, onRemoveAction }: Props) {
	const prodT = useTranslations('products');
	const productHref = useMemo(() => `/products/${product.fullSlug}`, [product.fullSlug]);
	const previewImage = toPreviewImage(
		buildProductImages(product.imageUrl, 1)[0] || resolveProductPrimaryImage(product.imageUrl)
	);

	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Accordion.Item value={product.id} borderBottom='none'>
				<Accordion.ItemTrigger w='100%' p='0' cursor='pointer'>
					<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} w='100%'>
						<LocaleNavLink href={productHref} mr='4'>
							<Image
								src={previewImage}
								alt={product.name ?? ''}
								width={120}
								height={120}
								style={{
									objectFit: 'contain',
									borderRadius: 'var(--chakra-radii-md)',
									border: '0.5px solid var(--chakra-colors-border)',
								}}
							/>
						</LocaleNavLink>
						<Flex direction='column' gap={2} w='100%'>
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
							<Text color='main' fontSize='xl' mb={{ base: 4, sm: 0 }} mr={{ base: 0, sm: 2 }}>
								{formatUsdPrice(price.current)}
								{price.previous != null && (
									<Text
										as='span'
										color='main.disabled'
										fontSize='sm'
										textDecoration='line-through'
										marginLeft='8px'
									>
										{formatUsdPrice(price.previous)}
									</Text>
								)}
								{price.savings != null && (
									<Badge
										variant='solid'
										color='black'
										bg='main.secondary'
										fontWeight='semibold'
										marginLeft='12px'
									>
										-{formatUsdPrice(price.savings)}
									</Badge>
								)}
							</Text>
						</Flex>
					</Flex>
					<Accordion.ItemIndicator />
				</Accordion.ItemTrigger>

				<Accordion.ItemContent>
					<Accordion.ItemBody p='0' pt='4'>
						<Flex justifyContent='space-between' mt='6'>
							<Stack>
								<Text fontWeight='medium' fontSize='md'>
									{review.user.name} {review.user.lastName ?? ''}
								</Text>
								<Rating
									id={`feedback-card-rating-${product.id}`}
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									readOnly
									size='xs'
									defaultValue={review.rating ?? 0}
								/>
								<DateWithLocale date={review.createdAt} />
							</Stack>

							<IconButton
								onClick={onRemoveAction}
								aria-label='Delete feedback'
								variant='ghost'
								rounded='md'
								color='main.disabled'
								disabled={pending}
								loading={pending}
								transition='all 0.2s ease-in-out'
								_hover={{
									bg: 'colorPalette.500',
									color: 'main.lightOnly',
								}}
							>
								<Icon size='lg'>
									<FiTrash2 />
								</Icon>
							</IconButton>
						</Flex>
						<Separator mt='4' color='border' />
						<Card.Body color='main' px='0' pb='0'>
							<DataList.Root flex='1'>
								{review.advantages && (
									<DataList.Item gap='2.5'>
										<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
											{prodT('advantages')}
										</DataList.ItemLabel>
										<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
											{review.advantages}
										</DataList.ItemValue>
									</DataList.Item>
								)}
								{review.disadvantages && (
									<DataList.Item gap='2.5'>
										<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
											{prodT('disAdvantages')}
										</DataList.ItemLabel>
										<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
											{review.disadvantages}
										</DataList.ItemValue>
									</DataList.Item>
								)}
								<DataList.Item gap='2.5'>
									<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
										{prodT('comment')}
									</DataList.ItemLabel>
									<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
										{review.comment}
									</DataList.ItemValue>
								</DataList.Item>
							</DataList.Root>
						</Card.Body>
					</Accordion.ItemBody>
				</Accordion.ItemContent>
			</Accordion.Item>
		</Card.Root>
	);
}
