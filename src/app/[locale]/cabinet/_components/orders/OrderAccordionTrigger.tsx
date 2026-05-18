import {
	Accordion,
	Badge,
	Flex,
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
import CountPill from '@/components/ui/CountPill';
import {
	resolveProductPrimaryImage,
	toPreviewImage,
} from '@/utils/productImages';
import { formatUsdPrice } from '@/utils/priceFormatting';
import type { OrderDetailTag, UserOrder } from '@/types/order';

type Props = {
	order: UserOrder;
	totalItems: number;
	thumbItems: UserOrder['items'];
	orderDetailTags: OrderDetailTag[];
};

const XS_MEDIA_QUERY = '@media screen and (min-width: 430px)';

export function OrderAccordionTrigger({ order, totalItems, thumbItems, orderDetailTags }: Props) {
	const productsT = useTranslations('products');
	const commonT = useTranslations('common');

	const totalDiscountText =
		order.totalDiscount > 0
			? `-${formatUsdPrice(order.totalDiscount)}`
			: formatUsdPrice(order.totalDiscount);

	return (
		<Accordion.ItemTrigger w='full' p='0' cursor='pointer' flexDirection='column'>
			<Flex
				w='full'
				alignItems='flex-start'
				justifyContent='space-between'
				direction='column'
				gap='3'
				css={{
					[XS_MEDIA_QUERY]: {
						alignItems: 'center',
						flexDirection: 'row',
					},
				}}
			>
				<VStack gap='3' alignItems='flex-start' minW='160px'>
					<Stat.Root>
						<Stat.Label fontSize={{ base: 'md', md: 'sm' }}>{productsT('totalAmount')}</Stat.Label>
						<Stat.ValueText fontSize='3xl'>{formatUsdPrice(order.total)}</Stat.ValueText>
					</Stat.Root>
					<HStack gap='2' flexWrap='wrap'>
						<Text fontSize={{ base: 'md', md: 'sm' }} fontWeight='semibold'>
							{`${productsT('numOfProducts')}:`}
						</Text>
						<CountPill value={totalItems} />
					</HStack>
					{order.totalDiscount > 0 ? (
						<Text fontSize={{ base: 'md', md: 'sm' }} fontWeight='medium'>
							{`${productsT('totalDiscount')}: `}
							<Badge
								variant='solid'
								color='black'
								bg='main.secondary'
								fontWeight='semibold'
							>
								{totalDiscountText}
							</Badge>
						</Text>
					) : null}
				</VStack>
				<HStack gap='2' display={{ base: 'none', md: 'flex' }} overflowX='auto'>
					{thumbItems.map((item) => {
						const previewImage = toPreviewImage(
							resolveProductPrimaryImage(item.product.imageUrl)
						);

						return (
								<Image
									key={item.id}
									width={114}
									height={114}
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
					gap='2'
					mt='2'
					flexWrap='wrap'
					w='full'
					css={{
						[XS_MEDIA_QUERY]: {
							gap: '4',
							marginTop: '4.5',
						},
					}}
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
							<Tag.Label fontSize={{ base: 'md', md: 'sm' }}>
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
