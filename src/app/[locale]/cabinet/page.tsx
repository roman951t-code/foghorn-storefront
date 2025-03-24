import { VStack, Heading } from '@chakra-ui/react';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import PersonalDataForm from '@/components/pages/cabinet/user/PersonalDataForm';

export default function Cabinet() {
	const authT = useTranslations('Auth');

	return (
		<VStack mt='4' w='100%'>
			<AccordionRoot collapsible multiple defaultValue={['payment']} variant='plain'>
				<AccordionItem mb='3' value='contacts' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='2xl' fontWeight='normal'>
							{authT('personalData')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<PersonalDataForm
							emailLabel={authT('email')}
							phoneLabel={authT('phone')}
							firstNameLabel={authT('name')}
							lastNameLabel={authT('lastname')}
						/>
					</AccordionItemContent>
				</AccordionItem>
				<AccordionItem mb='3' value='payment' borderBottomColor='border.light'>
					<AccordionItemTrigger>
						<Heading as='h2' size='2xl' fontWeight='normal'>
							{authT('deliveryAddress')}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent></AccordionItemContent>
				</AccordionItem>
			</AccordionRoot>
		</VStack>
	);
}
