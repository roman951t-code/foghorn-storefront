import { toaster } from '@/components/ui/chakra/toaster';

const DEFAULT_TOAST_DURATION = 5000;

type ToastType = 'success' | 'error';

export const showToaster = (
	type: ToastType,
	text?: string | null,
	duration = DEFAULT_TOAST_DURATION
) => {
	if (!text) return;

	toaster[type]({ title: text, duration });
};
