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
import { Box, Heading } from '@chakra-ui/react';

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
				<SecondaryButton w='160px' alignSelf='flex-end' hideFrom='lg' rounded='md'>
					<IoFilter />
					{btnText}
				</SecondaryButton>
			</DrawerTrigger>
			<DrawerContent
				bg='bg.tertiary'
				h='100%'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				boxShadow='none'
			>
				<DrawerBody
					display='flex'
					flexDirection='column'
					gap={4}
					px={{ base: 4, md: 5 }}
					py={{ base: 5, md: 6 }}
					overflowY='auto'
					overflowX='hidden'
					w='100%'
					minW={0}
				>
					<Box pb={3} borderBottomWidth='0.5px' borderBottomStyle='solid' borderColor='border'>
						<Heading fontWeight='semibold' textStyle='xl' color='main'>
							{btnText}
						</Heading>
					</Box>
					<QuickFilters maxProductPrice={maxProductPrice} />
					<Filters filters={filters} />
				</DrawerBody>
				<DrawerCloseTrigger
					color='main'
					_hover={{
						bg: 'transparent',
						borderWidth: '0.5px',
						borderStyle: 'solid',
						borderColor: 'main',
					}}
				/>
			</DrawerContent>
		</DrawerRoot>
	);
}
