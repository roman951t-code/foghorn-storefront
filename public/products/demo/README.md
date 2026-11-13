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

Additional colorful product photos (downloaded November 13, 2026, under the same
Unsplash License):

- `laptop-color`: [Fujiphilm](https://unsplash.com/photos/jGNabhDfoZI)
- `smartphone-gradient`: [Georgiy Lyamin](https://unsplash.com/photos/xQ3xDkWyjBs)
- `tablet-orange`: [Drum Pads 24](https://unsplash.com/photos/_ipIXpMMdsI)
- `keyboard-pink`: [Hillary Black](https://unsplash.com/photos/kFAECCSp7G8)
- `mouse-color`: [Brian Miner](https://unsplash.com/photos/x8yVFdU3JrI)
- `headphones-yellow`: [C D-X](https://unsplash.com/photos/oBI4NBP2Lhg)
- `controller-neon`: [Luis Villasmil](https://unsplash.com/photos/ITFwHdPEED0)
- `desktop-rgb`: [Andrey Matveev](https://unsplash.com/photos/MKSOFj9PsKA)
- `smartwatch-apps`: [Simon Daoudi](https://unsplash.com/photos/2wFoa040m8g)
- `speaker-blue`: [Sujith R](https://unsplash.com/photos/xWw4BJmfB5Y)
- `camera-yellow`: [Kirill Fokin](https://unsplash.com/photos/oOuJagHgj2U)
- `earbuds-wireless`: [Daniel Romero](https://unsplash.com/photos/y84Zn8TEySI)
- `smartphone-yellow`: [Daniel Romero](https://unsplash.com/photos/KeOUN9KaQAI)
- `accessories-color`: [Andrey Matveev](https://unsplash.com/photos/bxKb7H98v4o)
- `tablet-green`: [Victor Carvalho](https://unsplash.com/photos/QmVxgYIzXkc)
- `smartphone-coral`: [Andrey Matveev](https://unsplash.com/photos/hjYLhuPUO7Y)
- `console-yellow`: [Spencer](https://unsplash.com/photos/GvmWrvzWMLU)

The collection contains twenty photos, shared by product, category, and
subcategory demo image selection. Demo selection uses the whole collection;
generated galleries remain capped at the caller's requested image count.

Deployment does not require a database migration or reseed. Existing persisted
Picsum/LoremFlickr URLs are resolved when read or displayed. New seed data uses
local paths and preserves custom image URLs. The existing local SVG placeholder
is the error fallback. Real product uploads continue to use normal Next.js image
optimization and keep their exact URLs, including signatures and query parameters.
