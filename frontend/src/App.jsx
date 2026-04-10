import { Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import { motion, AnimatePresence } from "framer-motion";
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

  // Apply dark class to html for Tailwind dark: variants
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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

      {/* Modern toast with glass effect */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Toaster is still used from main.jsx but we can style it globally */}
      </div>
    </div>
  );
}

export default App;
