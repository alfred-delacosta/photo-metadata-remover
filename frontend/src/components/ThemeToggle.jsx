import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

/**
 * Floating theme toggle shared across pages.
 */
export default function ThemeToggle({ isDark, onToggleTheme }) {
  return (
    <motion.button
      className="fixed safe-fixed-top-right z-50 flex items-center justify-center min-w-11 min-h-11 p-3 bg-background-paper/90 backdrop-blur-sm rounded-card border border-border hover:border-primary/50 transition-colors focus-ring"
      onClick={onToggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      type="button"
    >
      {isDark ? <Sun className="w-6 h-6 text-accent" aria-hidden="true" /> : <Moon className="w-6 h-6 text-primary" aria-hidden="true" />}
    </motion.button>
  );
}
