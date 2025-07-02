import { HStack, Tag, Wrap } from '@chakra-ui/react';

export default function FiltersTags() {
	return (
		<Wrap gap='4'>
			{Array.from({ length: 6 }).map((_, index) => (
				<HStack key={index}>
					<Tag.Root
						variant='solid'
						size='lg'
						bg={{ base: 'bg', _hover: 'bg.accent' }}
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						borderColor='border.light'
						_hover={{ color: 'black' }}
					>
						<Tag.Label>Filter</Tag.Label>
						<Tag.EndElement>
							<Tag.CloseTrigger cursor='pointer' />
						</Tag.EndElement>
					</Tag.Root>
				</HStack>
			))}
		</Wrap>
	);
}
