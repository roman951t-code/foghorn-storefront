---
name: add-locale
description: Add a new supported storefront/admin locale (e.g. Polish alongside the existing uk/en). Use whenever the user asks to add a language, add a locale, support a new market's language, or translate the store into a new language.
---

# Add a new locale

There's no separate "locales table" — everything derives from one constant plus
one new JSON file. Most of the app (routing, sitemap, hreflang, middleware) is
already locale-count-agnostic and needs **no edit**; the risk is a handful of
hardcoded `locale === 'uk'` binary switches that silently do the wrong thing for
a third locale instead of erroring.

## 1. Core i18n — required for every new locale

1. **`src/constants/locales.ts`** — add the new code to:
   - `APP_LOCALES` (the source-of-truth array)
   - `LANGUAGE_OPTIONS` (label + flag shown in the UI switcher)
   - `LOCALE_TO_INTL_MAP` (e.g. `pl: 'pl-PL'` — used for `Intl`/OG locale)
   - `LOCALE_TO_HTML_LANG` (e.g. `pl: 'pl'` — the `<html lang>` value)
   - Don't touch `isAppLocale`/`resolveAppLocale`/`DEFAULT_LOCALE` — computed
     from the above.
2. **`locales/<code>.json`** — new file, one per locale. Copy `locales/uk.json`'s
   top-level namespace keys exactly (`common, checkout, navigation, auth,
   emails, validation, cart, wishlist, products, orders, pagination, errors,
   pages, promoStripe`) and translate every string — a missing namespace/key
   silently falls back to whatever `getLocaleFallbacks` resolves to, not an
   error.
3. **`src/i18n/messages.ts`** — add the new locale to `localeMessages` (a
   dynamic `import('../../locales/<code>.json')`). Everything else (client
   message loading, `generateStaticParams`) consumes this automatically.

## 2. Auto-derived — verify, don't edit

These already iterate `routing.locales` / `APP_LOCALES` and need no manual
change once step 1 is done — just confirm after:
- `src/i18n/routing.ts`, `src/i18n/request.ts` — `locales`/`defaultLocale`.
- `proxy.ts` (root middleware) — `createMiddleware(routing)`; matcher is a
  generic path regex, not locale-specific.
- `src/utils/seo.ts`'s `buildLanguageAlternates` and `src/app/sitemap.ts` — both
  loop `routing.locales` for hreflang/sitemap entries.
- `next.config.ts` — nothing locale-specific to touch.

## 3. Hardcoded binary switches — MUST fix, or the new locale silently misbehaves

These don't derive from `routing.locales` and default to English/Ukrainian for
anything that isn't `'uk'`:
- `src/components/layout/header/LocaleSwitcher.tsx` (`FlagIcon`) — `if (locale
  === 'uk') {...} else {/* GB flag */}` — add a real branch or the new locale
  renders the wrong flag.
- `src/app/[locale]/layout.tsx` (`skipToMainLabel`) — `locale === 'uk' ? '...'
  : 'Skip to main content'` — new locale gets English a11y text; add a real
  branch or a translation lookup.
- Optional/cosmetic, fix only if it matters for the launch: `src/admin/components/LocalizedTranslationsEditor.tsx`
  (`localeLabel`) if the new locale is added to admin content editing (§4);
  `src/utils/attributeLocalization.ts` / `src/utils/unitLocalization.ts`
  (`resolveTargetLocale` returns `null` for unknown locales → product attribute
  names/units stay in Ukrainian instead of erroring — safe but untranslated).

## 4. Admin (AdminJS) — two INDEPENDENT locale lists, don't confuse them

- **Content-editing locales**: `src/admin/constants/localization.ts`'s
  `ADMIN_TRANSLATION_LOCALES` — add the new code here so editors get a
  `i18n_<code>_<field>` virtual field for products/categories/banners/pages
  (`src/admin/resources/index.mts`). This is what lets someone actually type
  Polish product names into the admin panel. Required for real content in the
  new locale to exist.
- **Admin panel's OWN UI chrome language** (button/menu labels of AdminJS
  itself) is a *completely separate*, English/Ukrainian-only (`en`/`ua`, note
  `ua` not `uk`) concern — `src/admin/config/locale.mts`,
  `src/admin/locales/{en,ua}.mts`, wired via `src/admin/admin.mts`
  (`availableLanguages`). Only touch this if you also want AdminJS's interface
  translated — not required just to store new-locale content.

## 5. Database — no migration needed

`ProductTranslation`, `ProductCategoryTranslation`, `BannerTranslation`,
`PageTranslation` (`prisma/schema.prisma`) all store `locale String` as free
text with a unique/index constraint including `locale` — a flexible key-value
shape. Adding a locale means inserting new rows (via the admin editor from §4),
not a schema change.

## 6. Verify

- `npm run typecheck` and `npm run lint` (a missing JSON namespace key is a
  runtime fallback, not a type error — manually spot-check a few pages in each
  namespace).
- Load the storefront in the new locale (`/pl`) and check: flag icon in the
  locale switcher, skip-to-main a11y label, `<html lang>`, hreflang tags in
  `<head>` (`view-source` or `document.querySelectorAll('link[hreflang]')`),
  and that `sitemap.xml` includes `/pl` entries.
- In the admin panel, confirm the new `i18n_<code>_*` fields appear on
  product/category/banner/page forms if `ADMIN_TRANSLATION_LOCALES` was
  updated.
