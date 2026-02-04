import type { StorefrontFormPublic } from '@/actions/storefront/getEnabledStorefrontForms';

function looksOptional(text: string | null | undefined) {
	if (!text) return false;
	return text.trim().toLowerCase().includes('optional');
}

export function isBlockingCheckoutConsent(form: StorefrontFormPublic) {
	if (!form.enabled) return false;
	if (!form.required) return false;

	// Guardrail: treat clearly-marked optional forms as non-blocking,
	// even if the DB `required` flag was accidentally turned on.
	if (form.key === 'checkout-marketing') return false;
	if (looksOptional(form.description) || looksOptional(form.title) || looksOptional(form.checkboxLabel)) {
		return false;
	}

	return true;
}
