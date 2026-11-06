import { Routes, Route, useLocation } from "react-router";
import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import { motion, AnimatePresence } from "framer-motion";
import "./css/App.css";

/**
 * App entry: Tailwind design tokens, dark-mode class on html, route transitions.
 */
function App() {
  const location = useLocation();
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

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: [0.2, 0, 0, 1] },
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-control"
      >
        Skip to content
      </a>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div key="upload" {...pageTransition}>
                <FileUpload isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
          <Route
            path="/viewImage/:filename"
            element={
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <ViewImage isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
          <Route
            path="/results/:sessionId"
            element={
              <motion.div key="results" {...pageTransition}>
                <Results isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
          <Route
            path="/notfound"
            element={
              <motion.div key="notfound" {...pageTransition}>
                <NotFound isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
          <Route
            path="/*"
            element={
              <motion.div key="catch" {...pageTransition}>
                <NotFound isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
