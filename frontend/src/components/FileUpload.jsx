import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expirationTime, setExpirationTime] = useState(0);
  const navigate = useNavigate();
  const [preset, setPreset] = useState('medium');
  const [format, setFormat] = useState('jpeg');
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState({processed: 0, total: 0});

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("preset", preset);
    formData.append("format", format);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setSessionId(res.data.sessionId);
      setStatus("processing");
      toast.success("Upload complete, processing...");
    } catch (error) {
      setStatus("error");
      setUploadProgress(0);
      console.log(error);
      toast.error("Upload Error!");
    }
  }, [preset, format]);

const onDrop = useCallback((acceptedFiles) => {
  const limitedFiles = acceptedFiles.slice(0, 5);
  setFiles(limitedFiles);
  handleUpload(limitedFiles);
}, [handleUpload]);

  useEffect(() => {
    const getExpirationTime = async () => {
      const res = await api.get('/expirationTime');
      setExpirationTime(res.data);
    }

    getExpirationTime();
  }, [])

  useEffect(() => {
    let interval;
    if (sessionId && status === 'processing') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/progress/${sessionId}`);
          setProgress(res.data);
          if (res.data.processed === res.data.total) {
            navigate(`/results/${sessionId}`);
          }
        } catch (error) {
          console.log(error);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, status, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: true, 
    maxFiles: 5,
    accept: {
      'image/*': []
    }
  });

  return (
    <Grid container spacing={2} sx={{ maxWidth: 800, mx: "auto" }}>
      <Grid item xs={12}>
        <Paper sx={{ textAlign: "center", p: 5 }}>
          <Typography variant="h4" gutterBottom>
            Photo Metadata Remover
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Upload up to 5 photos. Processed images available for {expirationTime} minutes.
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Preset</InputLabel>
          <Select value={preset} label="Preset" onChange={(e) => setPreset(e.target.value)}>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="orig">Original</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Format</InputLabel>
          <Select value={format} label="Format" onChange={(e) => setFormat(e.target.value)}>
            <MenuItem value="jpeg">JPEG</MenuItem>
            <MenuItem value="webp">WebP</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Paper
          {...getRootProps()}
          sx={{
            p: 5,
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
            {isDragActive ? "Drop up to 5 images here ..." : "Drag & drop up to 5 images here, or click to select"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Supported: JPEG, PNG, WebP (max 10MB each)
          </Typography>
          <Button variant="contained" color="primary">
            Browse Files
          </Button>
        </Paper>
      </Grid>
      {files.length > 0 && (
        <Grid item xs={12}>
      <Paper sx={{p:3}}>
        <Typography variant="h6" gutterBottom>Selected Files ({files.length}/5)</Typography>
            {files.map((f, i) => (
              <Box key={i} display="flex" justifyContent="space-between" mb={1}>
                <Typography>{f.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(f.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      )}
      {status === "uploading" && (
        <Grid item xs={12}>
      <Paper sx={{p:3}}>
        <Typography variant="h6" gutterBottom>Upload Progress</Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2">{uploadProgress.toFixed(0)}%</Typography>
          </Paper>
        </Grid>
      )}
      {status === "processing" && (
        <Grid item xs={12}>
      <Paper sx={{p:3}}>
        <Typography variant="h6" gutterBottom>Processing Progress</Typography>
            <Typography>Processed: {progress.processed}/{progress.total}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress.total > 0 ? (progress.processed / progress.total * 100) : 0} 
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default FileUpload;