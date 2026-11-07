import { Link } from "react-router";

/**
 * Compact brand lockup for secondary pages.
 * The wordmark is outlined artwork, so the link carries the app name.
 * On-screen height stays at the 40px minimum (48px from the small breakpoint up).
 */
export default function BrandMark({ className = "" }) {
  const imageClass = "brand-mark h-10 w-auto sm:h-12";

  return (
    <Link
      to="/"
      aria-label="Photo Metadata Remover"
      className={`fixed safe-fixed-top-left z-50 inline-flex items-center rounded-control focus-ring ${className}`}
    >
      <img
        src="/brand/lockup-light.svg"
        alt=""
        width={126}
        height={40}
        className={`${imageClass} dark:hidden`}
      />
      <img
        src="/brand/lockup-dark.svg"
        alt=""
        width={126}
        height={40}
        className={`${imageClass} hidden dark:block`}
      />
    </Link>
  );
}
