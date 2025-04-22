import { BreadcrumbCurrentLink, BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/breadcrumb';
import { LuHouse } from 'react-icons/lu';
import { GiClothes } from 'react-icons/gi';
import { HiOutlineSlash } from 'react-icons/hi2';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import { useTranslations } from 'next-intl';

interface Props {
	category?: string;
	subcategory?: string;
	productId?: string;
}

export default function Breadcrumbs({ category, subcategory, productId }: Props) {
	const t = useTranslations('General');

	return (
		<BreadcrumbRoot variant='underline' separator={<HiOutlineSlash />}>
			<CatalogBtn
				fullText={false}
				trigger={
					<BreadcrumbLink
						fontSize='15px'
						transition='all .15s ease-in-out'
						textDecorationColor='main'
						color='link'
						_hover={{ cursor: 'pointer' }}
						_focus={{ outline: 'none' }}
					>
						<LuHouse /> {t('catalogShort')}
					</BreadcrumbLink>
				}
			/>

			{category && (
				<BreadcrumbLink
					href={`/catalog/${category}`}
					fontSize='15px'
					transition='all .15s ease-in-out'
					textDecorationColor='main'
					color='link'
					_hover={{ color: 'main', cursor: 'pointer' }}
					_focus={{ outline: 'none' }}
				>
					<GiClothes /> {category}
				</BreadcrumbLink>
			)}

			{subcategory && <BreadcrumbCurrentLink>{subcategory}</BreadcrumbCurrentLink>}
			{productId && <BreadcrumbCurrentLink>{productId}</BreadcrumbCurrentLink>}
		</BreadcrumbRoot>
	);
}
