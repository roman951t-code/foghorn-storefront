import { toaster } from '@/components/ui/chakra/toaster';

export const DEFAULT_TOAST_DURATION = 5000;

export type ToastType = 'success' | 'error';

export const showToaster = (
	type: ToastType,
	text?: string | null,
	duration = DEFAULT_TOAST_DURATION
) => {
	if (!text) return;

	toaster[type]({ title: text, duration });
};
