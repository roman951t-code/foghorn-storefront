---
name: seo-audit
description: Audit or fix on-page SEO for this storefront (metadata, Open Graph/Twitter cards, canonical/hreflang, JSON-LD, sitemap/robots, image alt text, heading structure, LCP/priority images). Use whenever the user asks about SEO gaps, indexing, Google Search Console, social share previews, or "why isn't this page ranking/showing up right when shared."
---

# SEO audit — online store (shop.foghornbay.com)

This is a checklist plus a list of pitfalls **specific to this codebase** that
already bit us once — check these first before doing a from-scratch audit.

## Where things live

- `src/utils/seo.ts` — `buildLanguageAlternates()`: canonical + hreflang builder
  shared by every page type. `APP_URL`, `absoluteUrl()`, `localizePath()`.
- `src/utils/i18nServerUtils.ts` — `getLocalizedMetadata()`: shared metadata
  helper used by the homepage and most static pages.
- `src/app/[locale]/layout.tsx` — root metadata defaults, Organization +
  WebSite JSON-LD (with `SearchAction`), `verification.google` site-verification
  tag.
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/constants/sitemap.ts` — robots
  rules and the dynamic sitemap (pulls categories/subcategories/products per
  locale from the DB).
- Product page: `src/app/[locale]/products/[category]/[subcategory]/[product]/page.tsx`
  — metadata (DB `metaTitle`/`metaDescription` override i18n defaults), Product
  + BreadcrumbList JSON-LD.
- `src/app/[locale]/opengraph-image.tsx` and the per-product
  `.../[product]/opengraph-image.tsx` — dynamically generated share-card images
  (title + price + brand, rendered via `next/og`).

## Checklist

1. **Metadata** — every route type (home, category, subcategory, product,
   search, static/legal, cabinet/checkout) should have `generateMetadata` with
   a real title/description, not the layout default. `search`, `checkout`,
   `cabinet` should be `robots: { index: false }`.
2. **OG/Twitter images — check for shadowing.** If a route has a file-based
   `opengraph-image.tsx`, any explicit `openGraph.images` (or `twitter.images`)
   set in that route's `generateMetadata` **completely shadows the file
   convention** — Next.js only falls back to the file when `images` is absent,
   not merely falsy. This bit us on both the homepage and product pages: the
   dynamic generators existed but were dead code because `getLocalizedMetadata`
   / `buildProductMetadata` always set a static fallback image. Pattern to
   verify: `images` key should only be set when there's a genuine per-instance
   override (e.g. admin-configured `product.openGraphImage`); otherwise omit
   the key entirely so the generator fires. Confirm live via:
   ```js
   document.querySelector('meta[property="og:image"]').content
   ```
   should resolve to the `/opengraph-image` route, not a static asset path,
   wherever a generator file exists for that segment.
3. **Canonical/hreflang — don't leak query params into canonical.**
   `buildLanguageAlternates(locale, pathname, searchParams)` will bake
   `searchParams` straight into the canonical URL if you pass any. UI state
   that doesn't change the page's actual content (tab selectors, sort order,
   pagination that isn't real pagination) must NOT be passed in — it self-
   canonicalizes a URL variant that Google will then index separately. This
   was a real bug: the product page's `?tab=feedback`/`?tab=characteristics`
   used to canonicalize to themselves instead of the base product URL.
4. **Heading structure — exactly one `<h1>` per rendered page, always,
   regardless of client-side state.** This codebase has a client-side product
   tab switcher (`ProductTabs.tsx`) that only mounts the *selected* tab's
   content on the initial render (SSR seeds `selectedTab` from `?tab=`) — so a
   direct link to a non-default tab can render zero `<h1>` if the h1 lives
   inside one specific tab's component. Fix pattern used here: a persistent
   `srOnly` `<h1>` rendered unconditionally in the page component (outside the
   tab switcher), with the tab's own visible heading demoted to `<h2>` to avoid
   a duplicate h1. Check any future tab/accordion/step-UI the same way: does
   the page's only h1 depend on client state that isn't guaranteed on first
   render?
5. **Image priority scoping.** `ProductsSlider`/`ProductCard`'s `imagePriority`
   must only be true for the section that's actually above the fold on load.
   Homepage sections pass `lazyMount` for everything below the first
   ("popular") section specifically so they mount only near-viewport —
   `imagePriority` must follow the same signal (`!lazyMount`), not a flat
   "first N slides of every slider" rule, or multiple `priority` images per
   page dilute the real LCP candidate.
6. **Sitemap/robots** — `src/constants/sitemap.ts` lists only public static
   routes; cabinet/checkout must stay absent from both `robots.ts`'s allow
   list and the sitemap. Verify product/category counts in `sitemap.ts` match
   what's actually published (`inStock`/published filters), not every DB row.
7. **Image alt text** — meaningful (`product.name + ' photo'` pattern), never
   empty `alt=""` except on purely decorative icons that already have an
   `aria-label` on their parent link/button.
8. **noindex leftovers** — grep for literal `noindex` to make sure every hit
   is intentional (search/checkout/cabinet/not-found), not a staging leftover.

## Verifying fixes

Use the Browser preview (`preview_start` with the `web` launch config), then in
`javascript_tool`:
```js
JSON.stringify({
  canonical: document.querySelector('link[rel="canonical"]')?.href,
  ogImage: document.querySelector('meta[property="og:image"]')?.content,
  verification: document.querySelector('meta[name="google-site-verification"]')?.content,
  h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent),
})
```
Check both the default tab/state and any `?tab=`/query-param variant that a
crawler could land on directly.

## Google Search Console

Properties for `foghornbay.com` (landing) and `shop.foghornbay.com` (this
store) are verified via the HTML `<meta name="google-site-verification">` tag
(same token works for both — it's account-level, not per-property), set in
each repo's root layout metadata. After any deploy that changes indexable
content, submit the sitemap and use URL Inspection → Request Indexing on
changed pages at https://search.google.com/search-console rather than waiting
for the next crawl.
