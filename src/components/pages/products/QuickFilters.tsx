import { Radio, RadioGroup } from '@/components/ui/radio';
import { VStack, Flex } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PriceSlider from './PriceSlider';

export default function QuickFilters() {
	const t = useTranslations('Products');
	return (
		<Flex flexDirection='column' gap='6'>
			<RadioGroup variant='outline' defaultValue='react' spaceX='4' colorPalette='orange'>
				<VStack gap='4' alignItems='flex-start'>
					<Radio w='100%' value='3'>
						{t('new')}
					</Radio>
					<Radio w='100%' value='1'>
						{t('expensiveToCheap')}
					</Radio>
					<Radio w='100%' value='2'>
						{t('cheapToExpensive')}
					</Radio>
				</VStack>
			</RadioGroup>
			<PriceSlider title={t('price')} />
		</Flex>
	);
}
