import { isBundledDemoImage } from './demoImages';

/** Bundled WebP files are already compressed and sized; serve them as static assets. */
export function shouldBypassImageOptimization(src: string): boolean {
	return isBundledDemoImage(src);
}
