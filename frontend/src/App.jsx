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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
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
                <ViewImage isDark={isDark} onToggleTheme={toggleTheme} />
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
                <Results isDark={isDark} onToggleTheme={toggleTheme} />
              </motion.div>
            }
          />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
