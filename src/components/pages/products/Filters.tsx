import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { VStack, CheckboxGroup, Fieldset } from '@chakra-ui/react';
import { Checkbox } from '@/components/ui/checkbox';

export default function Filters() {
	return (
		<VStack mt='8' w='100%'>
			<AccordionRoot collapsible multiple defaultValue={['Колір']}>
				<AccordionItem mb='3' value='Колір' borderBottomColor='border.light'>
					<AccordionItemTrigger>Колір</AccordionItemTrigger>
					<AccordionItemContent>
						<Fieldset.Root>
							<CheckboxGroup defaultValue={['react']} name='framework'>
								<Fieldset.Content colorPalette='orange' w='100%'>
									<Checkbox variant='outline' value='react' _hover={{ cursor: 'pointer' }}>
										Чорний
									</Checkbox>
									<Checkbox variant='outline' value='svelte' _hover={{ cursor: 'pointer' }}>
										Зелений
									</Checkbox>
									<Checkbox variant='outline' value='vue' _hover={{ cursor: 'pointer' }}>
										Синій
									</Checkbox>
									<Checkbox variant='outline' value='angular' _hover={{ cursor: 'pointer' }}>
										Жовтий
									</Checkbox>
								</Fieldset.Content>
							</CheckboxGroup>
						</Fieldset.Root>
					</AccordionItemContent>
				</AccordionItem>

				<AccordionItem mb='3' value='Бренд' borderBottomColor='border.light'>
					<AccordionItemTrigger>Бренд</AccordionItemTrigger>
					<AccordionItemContent>
						<Fieldset.Root>
							<CheckboxGroup defaultValue={['react']} name='framework'>
								<Fieldset.Content colorPalette='orange' w='100%'>
									<Checkbox variant='outline' value='react' _hover={{ cursor: 'pointer' }}>
										Чорний
									</Checkbox>
									<Checkbox variant='outline' value='svelte' _hover={{ cursor: 'pointer' }}>
										Зелений
									</Checkbox>
									<Checkbox variant='outline' value='vue' _hover={{ cursor: 'pointer' }}>
										Синій
									</Checkbox>
									<Checkbox variant='outline' value='angular' _hover={{ cursor: 'pointer' }}>
										Жовтий
									</Checkbox>
								</Fieldset.Content>
							</CheckboxGroup>
						</Fieldset.Root>
					</AccordionItemContent>
				</AccordionItem>

				<AccordionItem mb='3' value='Модель' borderBottomColor='border.light'>
					<AccordionItemTrigger>Модель</AccordionItemTrigger>
					<AccordionItemContent>
						<Fieldset.Root>
							<CheckboxGroup defaultValue={['react']} name='framework'>
								<Fieldset.Content colorPalette='orange' w='100%'>
									<Checkbox variant='outline' value='react' _hover={{ cursor: 'pointer' }}>
										Чорний
									</Checkbox>
									<Checkbox variant='outline' value='svelte' _hover={{ cursor: 'pointer' }}>
										Зелений
									</Checkbox>
									<Checkbox variant='outline' value='vue' _hover={{ cursor: 'pointer' }}>
										Синій
									</Checkbox>
								</Fieldset.Content>
							</CheckboxGroup>
						</Fieldset.Root>
					</AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
		</VStack>
	);
}
