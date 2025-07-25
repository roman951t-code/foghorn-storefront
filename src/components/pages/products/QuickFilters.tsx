import { VStack, Flex } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PriceSlider from './PriceSlider';
import { Radio, RadioGroup } from '@/components/reusable/chakra/radio';

export default function QuickFilters() {
	const t = useTranslations('Products');
	return (
		<Flex flexDirection='column' gap='6'>
			<RadioGroup defaultValue='react' spaceX='4' colorPalette='gray' w='100%'>
				<VStack gap='4' alignItems='flex-start'>
					<Radio w='100%' value='3' _hover={{ cursor: 'pointer' }}>
						{t('new')}
					</Radio>
					<Radio w='100%' value='1' _hover={{ cursor: 'pointer' }}>
						{t('expensiveToCheap')}
					</Radio>
					<Radio w='100%' value='2' _hover={{ cursor: 'pointer' }}>
						{t('cheapToExpensive')}
					</Radio>
				</VStack>
			</RadioGroup>
			<PriceSlider title={t('price')} />
		</Flex>
	);
}
