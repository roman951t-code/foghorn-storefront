import type { PropertyJSON } from 'adminjs';
import { useTranslation } from 'adminjs';
import { Icon } from '@adminjs/design-system';

const TRANSLATION_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/i;

const normalizeText = (value: unknown): string => {
	if (typeof value !== 'string') return '';
	return value.trim();
};

export default function PropertyDescription(props: { property: PropertyJSON }) {
	const { property } = props;
	const { translateMessage } = useTranslation();
	if (!property?.description) return null;
	const descriptionKey = normalizeText(property.description);
	if (!descriptionKey) return null;
	const translated = normalizeText(translateMessage(descriptionKey));

	// If a key-like token has no locale match, avoid rendering a dead help icon.
	if (!translated || (translated === descriptionKey && TRANSLATION_KEY_PATTERN.test(descriptionKey))) {
		return null;
	}

	return (
		<span
			className='admin-property-description'
			title={translated}
			data-tooltip={translated}
			aria-label={translated}
			tabIndex={0}
		>
			<Icon icon='HelpCircle' color='info' />
		</span>
	);
}
