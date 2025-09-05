import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const handleUpload = async (event) => {
    let formElement = document.getElementById("fileUpload");
    formElement.submit();
}

const FileUpload = () => {
  return (
    <>
      <Grid
        container
        justifyContent={"space-around"}
        alignItems={"center"}
        justifyItems={"center"}
      >
        <Grid size={11}>
          <Paper elevation={8}>
            <Grid container>
              <Grid size={12} padding={5}>
                <Typography fontSize={"6rem"} textAlign={"center"}>
                  Simple Photo Metadata Remover
                </Typography>
              </Grid>
              <Grid size={12} textAlign={"center"} padding={3}>
                <Typography variant="subtitle">
                  Upload your photo below to remove the metadata.
                </Typography>
              </Grid>
              <Grid size={12} justifyContent={"space-around"} textAlign={"center"} padding={5}>
                <Box> 
                    <form id="fileUpload" action="http://localhost:3015/upload">
                        <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        size="large"
                        >
                        Upload files
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleUpload}
                        />
                        </Button>
                    </form>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default FileUpload;
