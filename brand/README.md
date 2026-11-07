# Lifted Tag brand

Approved direction B for Photo Metadata Remover. Viewfinder corners frame a photo, and a cyan tag is cut loose and drifts off the image. Credit: Advanced Software and AI Solutions LLC.

These files are the approved pack. Do not redraw the mark, recolor it, or put the tag back on the frame.

The app still removes metadata on the server with Sharp. Nothing in this brand claims on-device processing or a privacy guarantee.

## Where the files are used

| Source | Served from | Use |
|---|---|---|
| `svg/mark-small.svg` | `frontend/public/favicon.svg` and the 16/32 PNG favicons, plus `favicon.ico` (16, 32, 48) | Browsers at small sizes. Heavier corners, larger tag, thick white outline, no sun or dashes |
| `svg/mark.svg` | `frontend/public/brand/mark.svg` | Master tile for 64 px and up. Not used below 48 px |
| `svg/lockup-light.svg`, `svg/lockup-dark.svg` | `frontend/public/brand/` | Home title and the corner lockup. Outlined wordmark, no live font at runtime |
| `svg/app-icon-fullbleed.svg` | `apple-touch-icon.png`, `icons/maskable-*.png` | Platforms that apply their own mask. Opaque, square, no baked corners |
| `svg/mark.svg` (rounded tile) | `android-chrome-192x192.png`, `android-chrome-512x512.png` | Manifest `purpose: any` only |
| `social/og-image.svg`, `social/twitter-image.svg` | `frontend/public/og-image.png` (1200×630), `twitter-image.png` (1200×600) | Social cards. Tagline: "Strip metadata from photos, then resize for sharing." |

`svg/mark-transparent.svg` and the mono SVGs are masters for light paper, `currentColor`, ink, and white. They are not the favicon or the PWA icon.

Maskable icons are separate files. The manifest does not mark the rounded `android-chrome-512` tile as maskable. The approved safe-zone check put the farthest artwork pixel at radius 191, inside the 204.8 safe circle.

## In the interface

- Home title: the light or dark lockup, swapped with the `dark` class on `<html>`. The heading text stays available to assistive tech.
- Other pages: the same lockup in the existing top-left link, 40 px tall (48 px from the `sm` breakpoint up). That is the on-screen minimum. The 32 px rasters are only for dense, high-DPI navbars and are not used here.
- Below 48 px, use `mark-small` (the favicon set). From 64 px up, use `mark`.
- Clear space is at least one quarter of the mark height.
- Hover grows the corner lockup by 5% for 180 ms, and only when the visitor has not asked for reduced motion. It does not loop.

Wordmark outlines are Source Serif 4 Bold paths. The tag stays `#0891B2` with a white outline. Cyan on the blue tile alone does not separate; the outline has to stay.

## Do / don't

- Keep the top-right corner open for the tag.
- Use the full-bleed sources when a platform masks the icon.
- Don't add a shield, lock, or check mark.
- Don't recolor the tile outside `#1976D2` to `#0D47A1`, or stretch or rotate the mark.
- Don't describe processing as on-device.

## License

The wordmark and social type were set in Source Serif 4 and Source Sans 3 and then converted to paths. Source Serif 4 is Adobe's font under the SIL Open Font License 1.1 (`fonts/SourceSerif4-OFL.txt`). The app already loads that family from Fontsource for live UI text. Exported SVGs do not need the font at runtime.

Artwork copyright: Advanced Software and AI Solutions LLC.
