import { Product } from '@/types/product';
import { Tabs } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { ReviewProvider } from '../providers/ReviewProvider';

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
	const authT = useTranslations('auth');
	const genT = useTranslations('common');
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');

	const i18nData = {
		name: authT('name'),
		lastName: authT('lastName'),
		email: authT('email'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
		advantages: prodT('advantages'),
		disAdvantages: prodT('disAdvantages'),
		addReviewFail: validT('addReviewFail'),
		invalidFormData: validT('invalidFormData'),
		feedbackMinLength: validT('feedbackMinLength'),
		feedbackMaxLength: validT('feedbackMaxLength'),
	};

	if (!product) {
		return null;
	}

	const averageRating =
		product.reviews.length > 0
			? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
			: 0;

	const items = [
		{
			title: prodT('about'),
			content: (
				<AboutTab
					product={product}
					category={category}
					subcategory={subcategory}
					averageRating={averageRating}
				/>
			),
		},
		{
			title: prodT('characteristics'),
			content: <CharacteristicsTab product={product} attributes={product.attributes} />,
		},
		{
			title: prodT('feedback'),
			content: (
				<ReviewProvider initialReviews={product.reviews} productId={product.id}>
					<FeedbackTab
						i18nData={i18nData}
						averageRating={averageRating}
						deleteReviewFail={validT('deleteReviewFail')}
					/>
				</ReviewProvider>
			),
		},
	];

	return (
		<Tabs.Root
			mt='8'
			defaultValue={prodT(tab)}
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
