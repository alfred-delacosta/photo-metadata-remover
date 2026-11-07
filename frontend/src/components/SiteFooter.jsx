/**
 * Site-wide footer with house copyright.
 */
export default function SiteFooter({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`safe-footer mt-auto pt-12 text-center text-foreground-secondary text-sm border-t border-border/50 ${className}`}
    >
      <p>Copyright (c) {year} Advanced Software and AI Solutions LLC</p>
    </footer>
  );
}
