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
  Chip,
  Avatar,
} from "@mui/material";
import { CloudUpload, PhotoCamera, Settings, Visibility } from "@mui/icons-material";
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
  const [processedFiles, setProcessedFiles] = useState([]);
  const [hasPrevious, setHasPrevious] = useState(false);

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("preset", preset);
    formData.append("format", format);

    try {
      const res = await api.post("/upload", formData, {
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
      console.error("Upload error:", error);
      setStatus("error");
      setUploadProgress(0);
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
      try {
        const res = await api.get('/expirationTime');
        setExpirationTime(res.data);
      } catch {
        console.error('Failed to get expiration time');
        toast.error('Failed to load expiration time');
      }
    }

    getExpirationTime();

    // Check for previous results
    const saved = localStorage.getItem('photoResults');
    if (saved) {
      const { sessionId: savedId, expTime } = JSON.parse(saved);
      if (Date.now() < expTime) {
        setHasPrevious(true);
      } else {
        localStorage.removeItem('photoResults');
      }
    }
  }, [])

  useEffect(() => {
    let interval;
    if (sessionId && status === 'processing') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/progress/${sessionId}`);
          console.log('Progress:', res.data);
          setProgress(res.data);
          if (res.data.processed === res.data.total) {
            const sessionRes = await api.get(`/session/${sessionId}`);
            setProcessedFiles(sessionRes.data.files);
            setStatus('completed');
            toast.success('Processing complete!');
          }
        } catch (error) {
          console.error('Progress poll error:', error);
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
        <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
          🖼️ Photo Metadata Remover
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Upload up to 5 photos. Processed images available for {expirationTime} minutes.
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>🎨 Preset</Typography>
          <FormControl fullWidth>
            <InputLabel>Preset</InputLabel>
            <Select value={preset} label="Preset" onChange={(e) => setPreset(e.target.value)}>
              <MenuItem value="low">Low (1280x720)</MenuItem>
              <MenuItem value="medium">Medium (1920x1080)</MenuItem>
              <MenuItem value="high">High (3840x2160)</MenuItem>
              <MenuItem value="orig">Original</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>📁 Format</Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select value={format} label="Format" onChange={(e) => setFormat(e.target.value)}>
              <MenuItem value="jpeg">JPEG</MenuItem>
              <MenuItem value="webp">WebP</MenuItem>
            </Select>
          </FormControl>
        </Paper>
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
          <CloudUpload
            sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? "📂 Drop up to 5 images here ..." : "📂 Drag & drop up to 5 images here, or tap to select"}
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
            <Typography variant="h6" gutterBottom>📸 Selected Files ({files.length}/5)</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((f, i) => (
                <Chip
                  key={i}
                  avatar={<Avatar><PhotoCamera /></Avatar>}
                  label={`${f.name} (${(f.size / 1024).toFixed(1)} KB)`}
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      )}
      {status === "uploading" && (
        <Grid item xs={12}>
          <Paper sx={{p:3}}>
            <Typography variant="h6" gutterBottom>📤 Upload Progress</Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2">{uploadProgress.toFixed(0)}%</Typography>
          </Paper>
        </Grid>
      )}
      {status === "processing" && (
        <Grid item xs={12}>
          <Paper sx={{p:3}}>
            <Typography variant="h6" gutterBottom>⏳ Processing Progress</Typography>
            <Typography>Processed: {progress.processed}/{progress.total}</Typography>
            <LinearProgress
              variant="determinate"
              value={progress.total > 0 ? (progress.processed / progress.total * 100) : 0}
            />
          </Paper>
        </Grid>
      )}
      {status === "completed" && (
        <Grid item xs={12}>
          <Paper sx={{p:3}}>
            <Typography variant="h5" gutterBottom sx={{color: 'primary.main'}}>✅ Processing Complete! Navigate to Results</Typography>
            <Box mt={2}>
              <Button variant="contained" color="primary" startIcon={<Visibility />} onClick={() => navigate(`/results/${sessionId}`)}>
                View Results
              </Button>
            </Box>
          </Paper>
        </Grid>
      )}
      {status === "error" && (
        <Grid item xs={12}>
          <Paper sx={{p:3}}>
            <Typography variant="h6" gutterBottom sx={{color: 'error.main'}}>❌ Error</Typography>
            <Typography>Upload or processing failed. Please try again.</Typography>
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={() => setStatus("idle")}>
                Try Again
              </Button>
            </Box>
          </Paper>
        </Grid>
      )}
      {hasPrevious && (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Visibility />}
              onClick={() => {
                const saved = JSON.parse(localStorage.getItem('photoResults'));
                navigate(`/results/${saved.sessionId}`);
              }}
            >
              🔄 View Previous Results
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default FileUpload;