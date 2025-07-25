import {
	BreadcrumbCurrentLink,
	BreadcrumbLink,
	BreadcrumbRoot,
} from '@/components/reusable/chakra/breadcrumb';
import { GiClothes } from 'react-icons/gi';
import { HiOutlineSlash } from 'react-icons/hi2';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';

interface Props {
	category?: string;
	subcategory?: string;
	productId?: string;
}

export default function Breadcrumbs({ category, subcategory, productId }: Props) {
	return (
		<BreadcrumbRoot variant='underline' separator={<HiOutlineSlash />} size='lg'>
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
						Каталог
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
