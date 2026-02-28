'use client';

import type { RefCallback } from 'react';
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormRegister,
	UseFormRegisterReturn,
} from 'react-hook-form';

type MaskPattern = string | string[];

const DIGIT_SYMBOL = '9';

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const countPlaceholders = (mask: string) => [...mask].filter((char) => char === DIGIT_SYMBOL).length;

const getStaticPrefix = (mask: string) => {
	let prefix = '';

	for (const char of mask) {
		if (char === DIGIT_SYMBOL) break;
		prefix += char;
	}

	return prefix;
};

const parseMask = (mask: string, index: number) => {
	const prefix = getStaticPrefix(mask);

	return {
		mask,
		index,
		prefix,
		prefixDigits: sanitizeDigits(prefix),
		placeholders: countPlaceholders(mask),
	};
};

const chooseMask = (mask: MaskPattern, rawDigits: string) => {
	const digits = sanitizeDigits(rawDigits);
	const masks = Array.isArray(mask) ? mask : [mask];

	if (!masks.length) return '';

	const parsedMasks = masks.map(parseMask);

	const prefixMasks = parsedMasks.filter((item) => item.prefixDigits.length > 0);
	if (prefixMasks.length) {
		const sorted = [...prefixMasks].sort((a, b) => {
			if (a.prefixDigits.length !== b.prefixDigits.length) {
				return b.prefixDigits.length - a.prefixDigits.length;
			}
			return a.index - b.index;
		});

		const fittingPrefix =
			sorted.find((item) => {
				const trimmed = digits.startsWith(item.prefixDigits)
					? digits.slice(item.prefixDigits.length)
					: digits;
				return trimmed.length <= item.placeholders || item.placeholders === 0;
			}) ?? sorted[0];

		return fittingPrefix.mask;
	}

	const scored = parsedMasks.map((item) => {
		const matchesPrefix =
			item.prefixDigits.length > 0 &&
			digits.startsWith(item.prefixDigits) &&
			digits.length >= item.prefixDigits.length;

		const trimmedLength =
			matchesPrefix && digits.length > item.prefixDigits.length
				? digits.length - item.prefixDigits.length
				: digits.length;

		return {
			...item,
			matchesPrefix,
			trimmedLength,
			fits: trimmedLength <= item.placeholders || item.placeholders === 0,
		};
	});

	const fitting = scored.filter(({ fits }) => fits);
	const pool = fitting.length ? fitting : scored;

	const best = pool.sort((a, b) => {
		if (a.matchesPrefix !== b.matchesPrefix) return Number(b.matchesPrefix) - Number(a.matchesPrefix);
		if (a.prefixDigits.length !== b.prefixDigits.length) return b.prefixDigits.length - a.prefixDigits.length;
		if (a.fits !== b.fits) return Number(b.fits) - Number(a.fits);
		if (a.fits && b.fits && a.placeholders !== b.placeholders) return a.placeholders - b.placeholders;
		if (!a.fits && !b.fits && a.placeholders !== b.placeholders)
			return b.placeholders - a.placeholders;
		return a.index - b.index;
	})[0];

	return best?.mask ?? '';
};

const applyMask = (digits: string, mask: string) => {
	if (!mask) return digits;

	let result = '';
	let digitIndex = 0;

	for (const char of mask) {
		if (char === DIGIT_SYMBOL) {
			if (digitIndex >= digits.length) break;
			result += digits[digitIndex];
			digitIndex += 1;
			continue;
		}

		if (digitIndex < digits.length) {
			result += char;
		}
	}

	if (digitIndex < digits.length) {
		result += digits.slice(digitIndex);
	}

	return result;
};

const formatWithMask = (value: string, mask: MaskPattern) => {
	const digits = sanitizeDigits(value);
	const selectedMask = chooseMask(mask, digits);

	if (!selectedMask) return digits;

	const { prefix, prefixDigits, placeholders } = parseMask(selectedMask, 0);
	const hasAnyInput = digits.length > 0;
	const hasPrefixInput = hasAnyInput && prefixDigits.length > 0 && digits.startsWith(prefixDigits);

	const remainingDigits = hasPrefixInput ? digits.slice(prefixDigits.length) : digits;
	const limitedDigits = placeholders ? remainingDigits.slice(0, placeholders) : remainingDigits;

	if (!hasAnyInput) return '';

	const suffixMask = selectedMask.slice(prefix.length);
	const maskedRemainder = applyMask(limitedDigits, suffixMask);

	const prefixValue =
		(hasPrefixInput && prefix.length > 0 ? prefix : prefixDigits.length > 0 ? prefix : '') || '';

	if (prefixValue) {
		if (maskedRemainder) return `${prefixValue}${maskedRemainder}`;
		return prefixValue;
	}

	return maskedRemainder;
};

export function useMaskedInput<T extends FieldValues, D extends RegisterOptions>(
	registerFn: UseFormRegister<T>
) {
	return (
		fieldName: Path<T>,
		mask: MaskPattern,
		options?: (D & Record<string, unknown>) | D
	): UseFormRegisterReturn<Path<T>> => {
		const { ref, onChange, ...restRegister } = registerFn(fieldName, options as any);

		const format = (value: string) => formatWithMask(value, mask);

		const handleRef: RefCallback<HTMLInputElement> = (element) => {
			if (!element) return;

			const maskedValue = format(element.value);
			if (maskedValue !== element.value) {
				element.value = maskedValue;
			}

			if (typeof ref === 'function') {
				ref(element);
			} else if (ref) {
				(ref as { current: HTMLInputElement | null }).current = element;
			}
		};

		return {
			...restRegister,
			ref: handleRef,
			onChange: ((event) => {
				const target = (event as unknown as { target?: HTMLInputElement }).target;
				if (target) {
					const maskedValue = format(target.value);

					if (maskedValue !== target.value) {
						target.value = maskedValue;

						if (typeof target.setSelectionRange === 'function') {
							const cursor = maskedValue.length;
							requestAnimationFrame(() => {
								try {
									target.setSelectionRange(cursor, cursor);
								} catch {
									// ignore selection range errors
								}
							});
						}
					}
				}

				return onChange(event);
			}) as typeof onChange,
		};
	};
}
