import { useState } from "react";
import { Routes, Route } from "react-router";
import FileUpload from "./components/FileUpload";
import GrokFileUpload from "./components/GrokFileUpload";
import GrokFileUploadModified from "./components/GrokFileUploadModified";
import ViewImage from "./pages/ViewImage";
import TutorialFileUpload from "./components/TutorialFileUpload";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";

function App() {
  const [count, setCount] = useState(0);

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
          <Route path="/" element={<GrokFileUploadModified />} />
          <Route
            path="/viewImage/:fileName"
            element={<ViewImage />}
          />
        </Routes>
        {/* <TutorialFileUpload /> */}
        {/* <GrokFileUpload/> */}
        {/* <FileUpload /> */}
      </Grid>
    </>
  );
}

export default App;
