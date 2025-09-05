import { useState } from "react";
import FileUpload from "./components/FileUpload";
import GrokFileUpload from "./components/GrokFileUpload";
import GrokFileUploadModified from "./components/GrokFileUploadModified";
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
        {/* <TutorialFileUpload /> */}
        {/* <GrokFileUpload/> */}
        <GrokFileUploadModified></GrokFileUploadModified>
        {/* <FileUpload /> */}
      </Grid>
    </>
  );
}

export default App;
