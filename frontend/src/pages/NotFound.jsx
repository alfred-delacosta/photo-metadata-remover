import NotFoundSvg from "../Assets/404.svg?react";
import { Link } from "react-router";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import BrandMark from "../components/BrandMark";
import SiteFooter from "../components/SiteFooter";

/**
 * 404 page with brand chrome and house footer.
 */
const NotFound = ({ isDark, onToggleTheme }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col px-4">
      <BrandMark />
      <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />

      <main id="main-content" className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mb-8"
          >
            <NotFoundSvg className="w-64 h-64 mx-auto" aria-hidden="true" />
          </motion.div>
          <h1 className="font-display text-6xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-foreground-secondary mb-8">
            Page not found. Let&apos;s get you back.
          </p>
          <Link
            to="/"
            className="btn focus-ring inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            Back to upload
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFound;
