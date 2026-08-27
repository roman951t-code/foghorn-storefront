'use client';

import { Accordion, Card, EmptyState } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { FiTruck } from 'react-icons/fi';
import { IoBagCheckOutline } from 'react-icons/io5';
import type { OrderDetailTag, UserOrder } from '@/types/order';
import { OrderAccordionTrigger } from './OrderAccordionTrigger';
import { OrderAccordionContent } from './OrderAccordionContent';
import {
	formatMethodLabel,
	getOrderStatusLabel,
	getPaymentIcon,
	getShipmentIcon,
} from '@/utils/orderUtils';
import { ORDER_STATUS_COLOR_PALETTE_MAP } from '@/constants/orders';

type Props = {
	orders: UserOrder[];
	emptyText: string;
	onOrderMutated?: () => void;
};

export default function UserOrdersList({ orders, emptyText, onOrderMutated }: Props) {
	const ordersT = useTranslations('orders');

	if (!orders.length) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<IoBagCheckOutline />
					</EmptyState.Indicator>
					<EmptyState.Title>{emptyText}</EmptyState.Title>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	return (
		<Accordion.Root multiple>
			{orders.map((order) => {
				const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
				const statusLabel = getOrderStatusLabel(order.status, ordersT);
				const statusColorPalette =
					ORDER_STATUS_COLOR_PALETTE_MAP[order.status?.toLowerCase() ?? 'pending'] ?? 'gray';
				const thumbItems = Array.from(
					new Map(order.items.map((item) => [item.product.id, item])).values()
				).slice(0, 4);
				const orderDetailTags: OrderDetailTag[] = [
					{
						key: 'status',
						label: ordersT('status'),
						value: statusLabel,
						colorPalette: statusColorPalette,
					},
					{
						key: 'payment',
						label: ordersT('payment'),
						value: formatMethodLabel(order.paymentMethod),
						icon: getPaymentIcon(order.paymentMethod),
					},
					{
						key: 'shipment',
						label: ordersT('shipment'),
						value: formatMethodLabel(order.shipmentMethod),
						icon: getShipmentIcon(order.shipmentMethod),
					},
					...(order.trackingNumber
						? [
								{
									key: 'tracking' as const,
									label: ordersT('tracking'),
									value: order.trackingNumber,
									icon: FiTruck,
								},
							]
						: []),
				];

				return (
					<Card.Root
						minWidth='200px'
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						bg='bg.tertiary'
						p='4'
						mb='6'
						key={order.id}
					>
						<Accordion.Item value={order.id} borderBottom='none'>
							<OrderAccordionTrigger
								order={order}
								totalItems={totalItems}
								thumbItems={thumbItems}
								orderDetailTags={orderDetailTags}
							/>

							<OrderAccordionContent order={order} onOrderMutated={onOrderMutated} />
						</Accordion.Item>
					</Card.Root>
				);
			})}
		</Accordion.Root>
	);
}
