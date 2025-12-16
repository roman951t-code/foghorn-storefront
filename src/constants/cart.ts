import { type CartData } from '@/types/cart';
import { extractI18nData } from '@/utils/i18nUtils';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const EMPTY_CART_DATA: CartData = { items: [] };

export const CART_MESSAGE_KEYS = ['cart', 'emptyCart', 'emptyCartDescr', 'cartRemoveFailed'] as const;
export const CART_NAV_MESSAGE_KEYS = ['order'] as const;
export const CART_PRODUCT_MESSAGE_KEYS = ['totalAmount', 'numOfProducts'] as const;

export const getCartModalI18nData = (
	cartT: Translator,
	navT: Translator,
	prodT: Translator
) => ({
	...extractI18nData(cartT, [...CART_MESSAGE_KEYS]),
	order: navT(`header.${CART_NAV_MESSAGE_KEYS[0]}`),
	...extractI18nData(prodT, [...CART_PRODUCT_MESSAGE_KEYS]),
});
