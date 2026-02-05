import {
	Accordion,
	Flex,
	Highlight,
	HStack,
	Icon,
	Stat,
	Status,
	Tag,
	Text,
	VStack,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import DateWithLocale from '@/components/ui/DateWithLocale';
import { buildProductImages, toPreviewImage } from '@/utils/productImages';
import type { OrderDetailTag, UserOrder } from '@/types/order';

type Props = {
	order: UserOrder;
	totalItems: number;
	thumbItems: UserOrder['items'];
	orderDetailTags: OrderDetailTag[];
};

export function OrderAccordionTrigger({ order, totalItems, thumbItems, orderDetailTags }: Props) {
	const productsT = useTranslations('products');
	const commonT = useTranslations('common');

	const totalDiscountText = `${
		order.totalDiscount > 0 ? `-${order.totalDiscount.toFixed(2)}` : order.totalDiscount.toFixed(2)
	} ₴`;

	return (
		<Accordion.ItemTrigger w='full' p='0' cursor='pointer' flexDirection='column'>
			<Flex
				w='full'
				alignItems={{ base: 'flex-start', xs: 'center' } as any}
				justifyContent='space-between'
				direction={{ base: 'column', xs: 'row' } as any}
				gap='3'
			>
				<VStack gap='3' alignItems='flex-start' minW='160px'>
					<Stat.Root>
						<Stat.Label fontSize='sm'>{productsT('totalAmount')}</Stat.Label>
						<Stat.ValueText fontSize='3xl'>{order.total.toFixed(2)} ₴</Stat.ValueText>
					</Stat.Root>
					<Text textStyle='sm' fontWeight='normal'>
						<Highlight query={`${totalItems}`} styles={{ fontWeight: 'bold' }}>{`${productsT(
							'numOfProducts'
						)}: ${totalItems}`}</Highlight>
					</Text>
					{order.totalDiscount > 0 ? (
						<Text textStyle='sm' fontWeight='normal'>
							<Highlight
								query={totalDiscountText}
								styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
							>
								{`${productsT('totalDiscount')}: ${totalDiscountText}`}
							</Highlight>
						</Text>
					) : null}
				</VStack>
				<HStack gap='2' display={{ base: 'none', md: 'flex' }} overflowX='auto'>
					{thumbItems.map((item) => {
						const previewImage = toPreviewImage(
							buildProductImages(item.product.imageUrl, 1)[0] || '/assets/images/temp/1.webp'
						);

						return (
								<Image
									key={item.id}
									width={100}
									height={100}
									src={previewImage}
									alt={item.product.name}
									style={{
										objectFit: 'cover',
										borderRadius: 'var(--chakra-radii-md)',
										border: '0.5px solid var(--chakra-colors-border)',
									}}
								/>
							);
						})}
				</HStack>
				<Tag.Root
					py='1.5'
					variant='surface'
					borderWidth='0.5px'
					boxShadow='none'
					bg='bg.tertiary'
					borderColor='border'
					size='lg'
					color='main'
					minW='154px'
					mt={{ base: 4, sm: 0 }}
				>
					<Tag.Label>
						{commonT('from')} <DateWithLocale date={order.createdAt} />
					</Tag.Label>
				</Tag.Root>
			</Flex>
			<HStack justifyContent='space-between' w='full'>
				<HStack
					gap={{ base: '2', xs: '4' } as any}
					mt={{ base: '2', xs: '4.5' } as any}
					flexWrap='wrap'
					w='full'
				>
					{orderDetailTags.map(({ key, label, value, colorPalette, icon }) => (
						<Tag.Root
							key={key}
							variant='surface'
							borderWidth='0.5px'
							boxShadow='none'
							bg='bg.tertiary'
							borderColor='border'
							size='lg'
							color='main'
							py='1.5'
							mt={{ base: 4, sm: 0 }}
						>
							<Tag.Label fontSize='sm'>
								{key === 'status' ? (
									<Status.Root size='md' gap='2.5'>
										<Status.Indicator colorPalette={colorPalette ?? 'gray'} />
										<Text as='span' fontWeight='semibold'>
											{label}: {value}
										</Text>
									</Status.Root>
								) : (
									<HStack gapX='2.5' alignItems='center'>
										{icon ? <Icon as={icon} size='md' color='fg.muted' /> : null}
										<Text as='span' fontWeight='semibold'>
											{label}: {value}
										</Text>
									</HStack>
								)}
							</Tag.Label>
						</Tag.Root>
					))}
				</HStack>
				<Accordion.ItemIndicator alignSelf='flex-end' />
			</HStack>
		</Accordion.ItemTrigger>
	);
}
