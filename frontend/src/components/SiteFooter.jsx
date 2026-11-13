/**
 * Site-wide footer with house copyright and LLC site link.
 */
const ASAIS_URL = "https://advancedsoftwareandaisolutions.com";

export default function SiteFooter({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`safe-footer mt-auto pt-8 md:pt-12 text-center text-foreground-secondary text-sm border-t border-border/50 ${className}`}
    >
      <p>Copyright (c) {year} Advanced Software and AI Solutions LLC</p>
      <p className="mt-1">
        <a
          href={ASAIS_URL}
          rel="noopener noreferrer"
          target="_blank"
          className="text-primary underline-offset-2 hover:underline focus-ring rounded-sm"
        >
          advancedsoftwareandaisolutions.com
        </a>
      </p>
    </footer>
  );
}
