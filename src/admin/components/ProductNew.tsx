import type { ActionProps } from 'adminjs';
import { OriginalNew } from 'adminjs';
import { Box } from '@adminjs/design-system';
import ProductValidationErrorSummary from './ProductValidationErrorSummary';

export default function ProductNew(props: ActionProps) {
	return (
		<Box>
			<ProductValidationErrorSummary {...props} />
			<OriginalNew {...props} />
		</Box>
	);
}

