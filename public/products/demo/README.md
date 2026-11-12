# Bundled demo photography

These generic electronics photos replace the random Picsum demo photos. They are
illustrative demo content, not photographs of the fictional catalog models.
Full images are 1100 × 1100 WebP; card previews are 640 × 640 WebP (quality 80).
Both sizes are served directly, without runtime CDN downloads or Vercel image
transformations. Keep the filenames stable: `src/utils/demoImages.ts` maps old
persisted demo URLs to this collection.

Photo credits (downloaded November 12, 2026; [Unsplash License](https://unsplash.com/license)):

- `tech-desk`: [Christopher Gower](https://unsplash.com/photos/_aXa21cf7rY)
- `audio-desk`: [Jaimy de Hon](https://unsplash.com/photos/tDVdy6ku378)
- `camera-desk`: [Miguel A Amutio](https://unsplash.com/photos/Fqj1Zbu0CqE)

Deployment does not require a database migration or reseed. Existing persisted
Picsum/LoremFlickr URLs are resolved when read or displayed. New seed data uses
local paths and preserves custom image URLs. The existing local SVG placeholder
is the error fallback. Real product uploads continue to use normal Next.js image
optimization and keep their exact URLs, including signatures and query parameters.
