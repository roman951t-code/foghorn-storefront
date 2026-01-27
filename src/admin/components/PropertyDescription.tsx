import type { PropertyJSON } from 'adminjs';
import { useTranslation } from 'adminjs';
import { Box, Icon } from '@adminjs/design-system';

export default function PropertyDescription(props: { property: PropertyJSON }) {
	const { property } = props;
	const { tm } = useTranslation();
	if (!property?.description) return null;
	const translated = tm(property.description, property.resourceId);
	return (
		<Box as='span' mx='sm' display='inline-flex' alignItems='center' title={translated}>
			<Icon icon='HelpCircle' color='info' />
		</Box>
	);
}
