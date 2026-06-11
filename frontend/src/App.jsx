import { Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import { AnimatePresence, MotionConfig } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // used via JSX <motion.*> only — linter ignore for side-effect JSX import
import "./css/App.css";

/**
 * Modern App Entry Point
 * 
 * This has been completely refactored for a 2026 premium aesthetic.
 * - Dark mode first with smooth system preference detection
 * - Tailwind + custom design tokens instead of MUI
 * - Framer Motion for page transitions and micro-interactions
 * - Clean, educational code with clear comments explaining the "why"
 */
function App() {
  // Dark mode is now default (modern trend). We detect system preference
  // and allow toggling. This creates a calm, focused experience.
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved !== null) return saved === "dark";
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("themeMode", newIsDark ? "dark" : "light");
  };

  // Apply dark class to html for Tailwind dark: variants + dynamic theme-color for PWA
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDark ? '#0a0a0a' : '#ffffff');
    }
  }, [isDark]);

  // Lightweight beforeinstallprompt handling for medium PWA ambition (no SW)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('installDismissed')) {
        setShowInstall(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
    if (outcome === 'dismissed') {
      sessionStorage.setItem('installDismissed', '1');
    }
  };

  const dismissInstall = () => {
    setShowInstall(false);
    sessionStorage.setItem('installDismissed', '1');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          <Routes>
          <Route 
            path="/" 
            element={
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <FileUpload isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            } 
          />
          <Route 
            path="/viewImage/:filename" 
            element={
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ViewImage />
              </motion.div>
            } 
          />
          <Route 
            path="/results/:sessionId" 
            element={
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Results />
              </motion.div>
            } 
          />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      </MotionConfig>

      {/* Modern toast with glass effect */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Toaster is still used from main.jsx but we can style it globally */}
      </div>

      {/* Subtle install prompt (medium PWA) - dismissible, once per session */}
      {showInstall && deferredPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] max-w-xs sm:max-w-sm w-full px-4">
          <div className="glass rounded-2xl px-4 py-3 border border-border/60 flex items-center gap-3 shadow-glass text-sm">
            <span className="flex-1">Add Photo Metadata Remover to your home screen for quick access.</span>
            <button onClick={handleInstallClick} className="btn px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">Install</button>
            <button onClick={dismissInstall} className="btn px-2 py-1.5 text-foreground-secondary rounded-xl text-xs" aria-label="Dismiss install prompt">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
