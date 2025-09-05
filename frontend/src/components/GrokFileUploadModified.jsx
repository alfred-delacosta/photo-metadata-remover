import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinearProgress from "@mui/material/LinearProgress";
import axios from "axios";
import toast from "react-hot-toast";

const GrokFileUploadModified = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleFileUpload(file) {
    if (!file) return;

    setStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await axios.post("http://localhost:3015/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            // Axios provided function to show upload progress.
            onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total ? Math.round(progressEvent.loaded * 100) / progressEvent.total : 0;
                setUploadProgress(progress);
            }
        });

        // Send to the next page. TODO Fix this to move to the next page in react as opposed to the API.
        // location.href = res.data.url;
        console.log(res.data);

        setStatus('success');
        setUploadProgress(100);
        toast.success("Image uploaded!");
    } catch (error) {
        setStatus('error');
        setUploadProgress(0);
        console.log(error);
        toast.error("Upload Error!");
    }

  }

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
    handleFileUpload(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: "center",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.400",
          backgroundColor: isDragActive ? "primary.light" : "background.paper",
          transition: "all 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
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
    </Box>
  );
};

export default GrokFileUploadModified;
