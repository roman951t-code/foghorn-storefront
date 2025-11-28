import { Flex } from '@chakra-ui/react';
import {
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/chakra/drawer';
import QuickFilters from './QuickFilters';
import Filters from './Filters';
import { IoFilter } from 'react-icons/io5';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { Filter } from '@/types/product';

interface Props {
	maxProductPrice: number;
	btnText: string;
	filters: Filter[] | null;
}

export default function FiltersSidebar({ btnText, maxProductPrice, filters }: Props) {
	return (
		<DrawerRoot placement='end'>
			<DrawerBackdrop />
			<DrawerTrigger asChild>
				<SecondaryButton w='140px' alignSelf='flex-end' hideFrom='lg'>
					<IoFilter />
					{btnText}
				</SecondaryButton>
			</DrawerTrigger>
			<DrawerContent bg='bg.tertiary' w='280px'>
				<DrawerBody>
					<Flex flexDirection='column' h='100%' justifyContent='center'>
						<QuickFilters maxProductPrice={maxProductPrice} />
						<Filters filters={filters} />
					</Flex>
				</DrawerBody>
				<DrawerCloseTrigger
					color='main'
					_hover={{
						bg: 'transparent',
						border: '1px solid',
						borderColor: 'main',
					}}
				/>
			</DrawerContent>
		</DrawerRoot>
	);
}
