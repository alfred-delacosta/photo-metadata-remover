import { Routes, Route } from "react-router";
import FileUpload from "./components/FileUpload";
import ViewImage from "./pages/ViewImage";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <CssBaseline />
      <Grid
        container
        justifyContent={"space-around"}
        alignItems={"center"}
        bgcolor={`background: #0d65b8;
background: linear-gradient(30deg, rgba(13, 101, 184, 1) 11%, rgba(17, 131, 237, 1) 100%);`}
        height={"100vh"}
      >
        <Routes>
          <Route path="/" element={<FileUpload />} />
          <Route
            path="/viewImage/:fileName"
            element={<ViewImage />}
          />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Grid>
    </>
  );
}

export default App;
