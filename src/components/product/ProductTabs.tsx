import { Product } from '@/types/product';
import { Tabs } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const AboutTab = dynamic(() => import('./about/AboutTab'));
const CharacteristicsTab = dynamic(() => import('./CharacteristicsTab'));
const FeedbackTab = dynamic(() => import('./FeedbackTab'));

interface Props {
	category: string;
	subcategory: string;
	tab?: string;
	product: Product;
}

export default function ProductTabs({ tab = 'about', product, category, subcategory }: Props) {
	const t = useTranslations('Products');

	if (!product) {
		return null;
	}

	const items = [
		{
			title: t('about'),
			content: <AboutTab product={product} category={category} subcategory={subcategory} />,
		},
		{
			title: t('characteristics'),
			content: <CharacteristicsTab product={product} attributes={product.attributes} />,
		},
		{
			title: t('feedback'),
			content: <FeedbackTab reviews={product.reviews} productId={product.id} />,
		},
	];

	return (
		<Tabs.Root
			mt='8'
			defaultValue={t(tab)}
			width='full'
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			lazyMount
			unmountOnExit
			fitted
		>
			<Tabs.List mb='4'>
				{items.map((item, index) => (
					<Tabs.Trigger key={index} value={item.title} fontSize='md'>
						{item.title}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			{items.map((item, index) => (
				<Tabs.Content
					key={index}
					value={item.title}
					inset='0'
					_open={{
						animationName: 'fade-in, scale-in',
						animationDuration: '300ms',
					}}
					_closed={{
						animationName: 'fade-out, scale-out',
						animationDuration: '120ms',
					}}
				>
					{item.content}
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
}
