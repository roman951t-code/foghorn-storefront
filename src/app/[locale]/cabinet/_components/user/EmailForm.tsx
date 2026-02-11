import { Input, Field, VStack } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { useId } from 'react';
import { FIELD_ORIENTATION_MD } from '@/constants/forms';

interface Props {
	userEmail?: string;
	i18nData: I18nData;
}

export default function EmailForm({ i18nData, userEmail }: Props) {
	const emailId = useId();

	return (
		<Field.Root orientation={FIELD_ORIENTATION_MD} justifyContent='center'>
			<Field.Label maxH='20px' htmlFor={emailId}>
				{i18nData.email}
			</Field.Label>
			<VStack w='full' alignItems='flex-start'>
				<Input id={emailId} value={userEmail ?? ''} size='md' disabled readOnly />
			</VStack>
		</Field.Root>
	);
}
