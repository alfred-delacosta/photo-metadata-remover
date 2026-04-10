import NotFoundSvg from "../Assets/404.svg?react";
import { Link } from "react-router";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Modern NotFound Page - Clean 404 with Illustration
 *
 * Minimal, centered layout with subtle animation.
 * Uses the existing SVG for visual appeal.
 */
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <NotFoundSvg className="w-64 h-64 mx-auto" />
        </motion.div>
        <motion.h1
          className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          404
        </motion.h1>
        <motion.p
          className="text-xl text-foreground-secondary mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page not found. Let's get you back.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/">
            <button className="btn flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-3xl text-lg font-semibold shadow-card hover:shadow-glass">
              <Home className="w-5 h-5" />
              Back to Upload Page
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
