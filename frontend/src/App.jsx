import { Routes, Route } from "react-router";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import './css/App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          p: 2,
          background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
        }}
      >
        <CssBaseline />
        <Routes>
          <Route path="/" element={<FileUpload />} />
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
