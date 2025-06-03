import { Button, Flex } from '@chakra-ui/react';
import {
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerRoot,
	DrawerTrigger,
} from '@/components/ui/drawer';
import QuickFilters from './QuickFilters';
import Filters from './Filters';
import { IoFilter } from 'react-icons/io5';

interface Props {
	btnText: string;
}

export default function FiltersSidebar({ btnText }: Props) {
	return (
		<DrawerRoot placement='end'>
			<DrawerBackdrop />
			<DrawerTrigger asChild>
				<Button
					color='main'
					variant='outline'
					border='1px solid '
					borderColor='border'
					size='sm'
					w='140px'
					alignSelf='flex-end'
					hideFrom='lg'
				>
					<IoFilter />
					{btnText}
				</Button>
			</DrawerTrigger>
			<DrawerContent bg='bg.tertiary' w='280px'>
				<DrawerBody>
					<Flex flexDirection='column' h='100%' justifyContent='center'>
						<QuickFilters />
						<Filters />
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
