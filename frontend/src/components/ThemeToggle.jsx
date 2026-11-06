import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

/**
 * Floating theme toggle shared across pages.
 */
export default function ThemeToggle({ isDark, onToggleTheme }) {
  return (
    <motion.button
      className="fixed top-6 right-6 p-3 bg-background-paper/80 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/50 transition-all duration-200 z-50"
      onClick={onToggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? <Sun className="w-6 h-6 text-accent" /> : <Moon className="w-6 h-6 text-primary" />}
    </motion.button>
  );
}
