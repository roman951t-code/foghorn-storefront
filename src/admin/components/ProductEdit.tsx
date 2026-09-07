import type { ActionProps } from 'adminjs';
import { OriginalEdit } from 'adminjs';
import { Box } from '@adminjs/design-system';
import ProductValidationErrorSummary from './ProductValidationErrorSummary';

export default function ProductEdit(props: ActionProps) {
	return (
		<Box>
			<ProductValidationErrorSummary {...props} />
			<OriginalEdit {...props} />
		</Box>
	);
}

