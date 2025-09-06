import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinearProgress from "@mui/material/LinearProgress";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expirationTime, setExpirationTime] = useState(0);
  const navigate = useNavigate();

  async function handleFileUpload(file) {
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3015/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Axios provided function to show upload progress.
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round(progressEvent.loaded * 100) / progressEvent.total
            : 0;
          setUploadProgress(progress);
        },
      });

      setStatus("success");
      setUploadProgress(100);
      toast.success("Image uploaded!");
      navigate(`ViewImage/${res.data.fileName}?token=${res.data.accessToken}`);
    } catch (error) {
      setStatus("error");
      setUploadProgress(0);
      console.log(error);
      toast.error("Upload Error!");
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    handleFileUpload(acceptedFiles[0]);
  }, []);

  useEffect(() => {
    const getExpirationTime = async () => {
      const res = await axios.get('http://localhost:3015/expirationTime');
      setExpirationTime(res.data);
    }

    getExpirationTime();
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Paper sx={{ textAlign: "center", padding: 5}}>
          <Typography fontSize="4rem">
            Image Metadata Remover
          </Typography>
          <Typography variant="subtitle1">
            Upload an image to remove the metadata from it. <strong>The link with the new image will expire in {expirationTime} minutes.</strong>
          </Typography>
        </Paper>
      </Grid>
      <Grid size={12}>
        <Paper
          {...getRootProps()}
          sx={{
            p: 10,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "grey.400",
            backgroundColor: isDragActive
              ? "primary.light"
              : "background.paper",
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? "Drop the files here!" : "Drag & drop files here"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select files
          </Typography>
          <Button variant="contained" color="primary">
            Browse Files
          </Button>
          {file && status === "uploading" && (
            <Box marginTop={10}>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FileUpload;
