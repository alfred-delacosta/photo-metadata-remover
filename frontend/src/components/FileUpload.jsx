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
  Link,
  IconButton,
} from "@mui/material";
import {
  CloudUpload,
  PhotoCamera,
  Settings,
  Visibility,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const FileUpload = ({ mode, onToggleMode }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expirationTime, setExpirationTime] = useState(0);
  const navigate = useNavigate();
  const [preset, setPreset] = useState("medium");
  const [format, setFormat] = useState("jpeg");
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [processedFiles, setProcessedFiles] = useState([]);
  const [hasPrevious, setHasPrevious] = useState(false);

  const handleUpload = useCallback(
    async (files) => {
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

        if (!res.data.sessionId || !res.data.expTime) {
          throw new Error("Invalid response: missing sessionId or expTime");
        }
        const expTimeNum = Number(res.data.expTime);
        if (isNaN(expTimeNum)) {
          throw new Error("Invalid expTime: not a valid number");
        }

        setSessionId(res.data.sessionId);
        localStorage.setItem(
          "photoResults",
          JSON.stringify({
            sessionId: res.data.sessionId,
            expTime: expTimeNum,
          }),
        );
        console.log(
          "localStorage photoResults set:",
          localStorage.getItem("photoResults"),
        );
        setStatus("processing");
        toast.success("Upload complete, processing...");
      } catch (error) {
        console.error("Upload error:", error);
        setStatus("error");
        setUploadProgress(0);
        toast.error("Upload Error!");
      }
    },
    [preset, format],
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 5) {
        toast.error("Only 5 images are allowed.");
      }
      const limitedFiles = acceptedFiles.slice(0, 5);
      setFiles(limitedFiles);
      handleUpload(limitedFiles);
    },
    [handleUpload],
  );

  useEffect(() => {
    const getExpirationTime = async () => {
      try {
        const res = await api.get("/expirationTime");
        setExpirationTime(res.data);
      } catch {
        console.error("Failed to get expiration time");
        toast.error("Failed to load expiration time");
      }
    };

    getExpirationTime();

    // Check for previous results
    const saved = localStorage.getItem("photoResults");
    if (saved) {
      const { sessionId: savedId, expTime } = JSON.parse(saved);
      if (Date.now() < expTime) {
        setHasPrevious(true);
      } else {
        localStorage.removeItem("photoResults");
      }
    }
  }, []);

  useEffect(() => {
    let interval;
    if (sessionId && status === "processing") {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/progress/${sessionId}`);
          setProgress(res.data);
          if (res.data.processed === res.data.total) {
            const sessionRes = await api.get(`/session/${sessionId}`);
            setProcessedFiles(sessionRes.data.files);
            setStatus("completed");
            toast.success("Processing complete!");
          }
        } catch (error) {
          console.error("Progress poll error:", error);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, status, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error("Only 5 images are allowed.");
      }
    },
    multiple: true,
    maxFiles: 5,
    accept: {
      "image/*": [],
    },
  });

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <IconButton onClick={onToggleMode} color="inherit">
          {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: "primary.main" }}>
              🖼️ Photo Metadata Remover
            </Typography>
            <Typography variant="subtitle1">
              Upload up to 5 photos. Processed images available for {expirationTime} minutes.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            🎨 Preset
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Preset</InputLabel>
            <Select
              value={preset}
              label="Preset"
              onChange={(e) => setPreset(e.target.value)}
            >
              <MenuItem value="low">Low (1280x720)</MenuItem>
              <MenuItem value="medium">Medium (1920x1080)</MenuItem>
              <MenuItem value="high">High (3840x2160)</MenuItem>
              <MenuItem value="orig">Original</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            📁 Format
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={format}
              label="Format"
              onChange={(e) => setFormat(e.target.value)}
            >
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
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? "📂 Drop up to 5 images here ..."
                : "📂 Drag & drop up to 5 images here, or tap to select"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Supported: JPEG, PNG, WebP (max 10MB each)
            </Typography>
            <Button variant="contained" color="primary">
              Browse Files
            </Button>
          </Paper>
        </Grid>
        {hasPrevious && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Visibility fontSize="large" />}
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem('photoResults'));
                  navigate(`/results/${saved.sessionId}`);
                }}
              >
                View Previous Results
              </Button>
            </Box>
          </Grid>
        )}
        {files.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📸 Selected Files ({files.length}/5)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {files.map((f, i) => (
                  <Chip
                    key={i}
                    avatar={
                      <Avatar>
                        <PhotoCamera />
                      </Avatar>
                    }
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
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📤 Upload Progress
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2">
                {uploadProgress.toFixed(0)}%
              </Typography>
            </Paper>
          </Grid>
        )}
        {status === "processing" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ⏳ Processing Progress
              </Typography>
              <Typography>
                Processed: {progress.processed}/{progress.total}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  progress.total > 0
                    ? (progress.processed / progress.total) * 100
                    : 0
                }
              />
            </Paper>
          </Grid>
        )}
        {status === "completed" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                ✅ Processing Complete! Navigate to Results
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/results/${sessionId}`)}
                >
                  View Results
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
        {status === "error" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "error.main" }}
              >
                ❌ Error
              </Typography>
              <Typography>
                Upload or processing failed. Please try again.
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setStatus("idle")}
                >
                  Try Again
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
      <Box sx={{ textAlign: "center", mt: 4, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Created by{" "}
          <Link
            href="https://alfred-delacosta.github.io"
            target="_blank"
            rel="noopener noreferrer"
            color="primary.main"
          >
            Alfred De La Costa
          </Link>{" "}
          with help by{" "}
          <Link
            href="https://x.ai/"
            target="_blank"
            rel="noopener noreferrer"
            color="primary.main"
          >
            Grok
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default FileUpload;
