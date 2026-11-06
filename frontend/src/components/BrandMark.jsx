import { Link } from "react-router";

/**
 * Compact brand lockup for secondary pages.
 */
export default function BrandMark({ className = "" }) {
  return (
    <Link
      to="/"
      className={`fixed top-6 left-6 z-50 max-w-[min(70vw,16rem)] font-display text-lg md:text-xl font-semibold text-primary hover:text-accent transition-colors focus-ring rounded-control px-1 ${className}`}
    >
      Photo Metadata Remover
    </Link>
  );
}
