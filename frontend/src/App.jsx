import { Routes, Route } from "react-router";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import getTheme from "./theme";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import './css/App.css'

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || (prefersDarkMode ? 'dark' : 'light');
  });

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (!saved) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          p: 2,
          // display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          background: mode === 'dark'
            ? "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
        }}
      >
        <CssBaseline />
        <Routes>
          <Route path="/" element={<FileUpload mode={mode} onToggleMode={toggleMode} />} />
          <Route path="/viewImage/:filename" element={<ViewImage />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
