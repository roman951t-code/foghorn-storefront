import { Accordion, Card, Flex, Image, Separator, Stack, Stat, Text } from '@chakra-ui/react';
import { BsArrowRepeat } from 'react-icons/bs';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { buildProductImages, toPreviewImage } from '@/utils/productImages';
import type { UserOrder } from '@/types/order';
import type { TranslateFn } from './orderAccordionTypes';

type Props = {
	order: UserOrder;
	productsT: TranslateFn;
	ordersT: TranslateFn;
	commonT: TranslateFn;
};

export function OrderAccordionContent({ order, productsT, ordersT, commonT }: Props) {
	return (
		<Accordion.ItemContent>
			<Accordion.ItemBody p='0' pt='4'>
				<Flex justifyContent='flex-end' mb='4'>
					<PrimaryButton>
						<BsArrowRepeat />
						{productsT('repeatOrder')}
					</PrimaryButton>
				</Flex>

				<Stack gap='4' maxH='500px' overflowY='auto'>
					{order.items.map((item, idx) => {
						const previewImage = toPreviewImage(
							buildProductImages(item.product.imageUrl, 1)[0] || '/assets/images/temp/1.webp'
						);

						return (
							<div key={item.id}>
								<Flex
									alignItems='center'
									direction={{ base: 'column', md: 'row' }}
									w='full'
									gap='3'
								>
									<LocaleNavLink href={`/products/${item.product.fullSlug}`}>
										<Image
											width={110}
											height={110}
											src={previewImage}
											alt={item.product.name}
											style={{ objectFit: 'contain', borderRadius: '6px' }}
										/>
									</LocaleNavLink>

									<Flex direction='column' gap={2} w='full'>
										<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px'>
											<LocaleNavLink
												href={`/products/${item.product.fullSlug}`}
												textDecoration='underline'
												fontSize='md'
												color='main'
											>
												{item.product.name}
											</LocaleNavLink>
										</Card.Title>
										<Text
											color='main'
											fontSize='md'
											mb={{ base: 4, sm: 0 }}
											mr={{ base: 0, sm: 2 }}
										>
											{ordersT('unit')}: {item.unitPrice.toFixed(2)} ₴
										</Text>
									</Flex>
									<Stat.Root alignSelf='flex-end' color='main'>
										<Stat.ValueText textStyle='md' minW='42px'>
											{`x ${item.quantity}${commonT('units')}`}
										</Stat.ValueText>
									</Stat.Root>
								</Flex>

								{idx < order.items.length - 1 && <Separator mt='4' color='border.dark' />}
							</div>
						);
					})}
				</Stack>
			</Accordion.ItemBody>
		</Accordion.ItemContent>
	);
}
