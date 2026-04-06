import { Routes, Route } from "react-router";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import './css/App.css'

function App() {
  return (
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          background: "linear-gradient(30deg, rgba(13,101,184,1) 11%, rgba(17,131,237,1) 100%)",
        }}
      >
      <CssBaseline />
  <Grid container spacing={2} justifyContent="center" alignItems="stretch">
    <Routes>
        <Route path="/" element={<FileUpload />} />
        <Route path="/viewImage/:filename" element={<ViewImage />} />
        <Route path="/results/:sessionId" element={<Results />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="/*" element={<NotFound />} />
        </Routes>
      </Grid>
    </Box>
  );
}

export default App;
