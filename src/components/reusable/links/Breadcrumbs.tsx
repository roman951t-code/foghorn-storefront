import { BreadcrumbCurrentLink, BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/breadcrumb';
import { LuHouse, LuShirt } from 'react-icons/lu';
import { GiClothes } from 'react-icons/gi';
import { HiOutlineSlash } from 'react-icons/hi2';

export default function Breadcrumbs() {
	return (
		<BreadcrumbRoot variant='underline' separator={<HiOutlineSlash />}>
			<BreadcrumbLink
				href='/'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'main.accent' }}
				_focus={{ outline: 'none' }}
			>
				<LuHouse /> Home
			</BreadcrumbLink>
			<BreadcrumbLink
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'main.accent' }}
				_focus={{ outline: 'none' }}
				href='#'
			>
				<GiClothes /> Men Wear
			</BreadcrumbLink>
			<BreadcrumbLink
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'main.accent' }}
				_focus={{ outline: 'none' }}
				href='#'
			>
				<LuShirt /> Outfit
			</BreadcrumbLink>
			<BreadcrumbCurrentLink>Trousers</BreadcrumbCurrentLink>
		</BreadcrumbRoot>
	);
}
