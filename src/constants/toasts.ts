import { toaster } from '@/components/reusable/chakra/toaster';

export const DEFAULT_TOAST_DURATION = 5000;

export const showSuccessToast = (title: string) =>
	toaster.success({ title, duration: DEFAULT_TOAST_DURATION });
