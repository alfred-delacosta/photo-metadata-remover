import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Image as ImageIcon,
  Settings,
  Eye,
  Sun,
  Moon,
  Clock,
  Download,
  ArrowLeft,
  CheckCircle,
  Loader
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Link } from "react-router";

/**
 * Modern FileUpload Component - Premium Redesign
 * 
 * This is a complete UI/UX overhaul for a 2026 aesthetic:
 * - Glassmorphic dropzone with live drag feedback and spring animations
 * - Segmented controls for presets/formats (modern toggle style)
 * - Staggered file preview chips with hover lifts
 * - Shimmer progress indicators for perceived speed
 * - Fully responsive mobile-first design (touch-friendly, stacked layout)
 * - No emojis, clean Lucide icons
 * - Framer Motion for all interactions and entrances
 * 
 * Why this design? It feels expensive and intentional: calm dark gradients, subtle depth,
 * purposeful motion. References Stripe's form controls and Tesla's hero sections.
 */
const FileUpload = ({ isDark, onToggleTheme }) => {
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]);
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
  const [isDragging, setIsDragging] = useState(false);

  // All existing logic remains unchanged for functionality
  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setStatus("uploading");
    setUploadProgress(0);
    setFileStatuses(files.map(file => ({ name: file.name, status: 'uploading' })));
    toast("Starting upload...", { duration: 2000 });

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("preset", preset);
    formData.append("format", format);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      if (!res.data.sessionId || !res.data.expTime) {
        throw new Error("Invalid response");
      }
      const expTimeNum = Number(res.data.expTime);
      if (isNaN(expTimeNum)) {
        throw new Error("Invalid expTime");
      }

      setSessionId(res.data.sessionId);
      localStorage.setItem("photoResults", JSON.stringify({
        sessionId: res.data.sessionId,
        expTime: expTimeNum,
      }));
      setStatus("processing");
      setFileStatuses(files.map(file => ({ name: file.name, status: 'processing' })));
      toast.success("Upload complete, processing...");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      setUploadProgress(0);
      setFileStatuses(files.map(file => ({ name: file.name, status: 'error' })));
      toast.error("Upload Error!");
    }
  }, [preset, format]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 5) {
      toast.error("Only 5 images allowed.");
      return;
    }
    const limitedFiles = acceptedFiles.slice(0, 5);
    setFiles(limitedFiles);
    setFileStatuses(limitedFiles.map(file => ({ name: file.name, status: 'selected' })));
    handleUpload(limitedFiles);
  }, [handleUpload]);

  useEffect(() => {
    const getExpirationTime = async () => {
      try {
        const res = await api.get("/expirationTime");
        setExpirationTime(res.data);
      } catch {
        toast.error("Failed to load expiration time");
      }
    };

    getExpirationTime();

    const saved = localStorage.getItem("photoResults");
    if (saved) {
      const { expTime } = JSON.parse(saved);
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
          // Update file statuses based on processed count
          setFileStatuses(prev => prev.map((f, index) => ({
            ...f,
            status: index < res.data.processed ? 'completed' : 'processing'
          })));
          if (res.data.processed === res.data.total) {
            const sessionRes = await api.get(`/session/${sessionId}`);
            setProcessedFiles(sessionRes.data.files);
            setStatus("completed");
            setFileStatuses(prev => prev.map(f => ({ ...f, status: 'completed' })));
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
  }, [sessionId, status]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => toast.error("Only 5 images allowed."),
    multiple: true,
    maxFiles: 5,
    accept: { "image/*": [] },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Title - Staggered entrance */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Photo Metadata Remover
        </h1>
        <p className="text-xl md:text-2xl text-foreground-secondary max-w-2xl mx-auto">
          Upload up to 5 photos. Processed images available for {expirationTime} minutes.
        </p>
      </motion.div>

      {/* Controls - Segmented modern toggles */}
      <div className="flex flex-col lg:flex-row gap-4 justify-center mb-12 max-w-2xl mx-auto">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 text-foreground-secondary">Preset</label>
          <div className="flex gap-1">
            {["low", "medium", "high", "orig"].map((p) => (
              <motion.button
                key={p}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 btn font-medium text-sm whitespace-nowrap ${
                  preset === p
                    ? "bg-primary text-primary-foreground border-primary shadow-card"
                    : "border-border hover:border-primary/50 text-foreground-secondary hover:text-foreground"
                }`}
                onClick={() => setPreset(p)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 text-foreground-secondary">Format</label>
          <div className="flex gap-1">
            {["jpeg", "webp"].map((f) => (
              <motion.button
                key={f}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 btn font-medium text-sm whitespace-nowrap ${
                  format === f
                    ? "bg-primary text-primary-foreground border-primary shadow-card"
                    : "border-border hover:border-primary/50 text-foreground-secondary hover:text-foreground"
                }`}
                onClick={() => setFormat(f)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {f.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Glassmorphic Dropzone - Hero element with drag feedback */}
      <motion.div
        {...getRootProps()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 md:p-20 text-center transition-all duration-300 ${
          isDragging || isDragActive
            ? "border-accent bg-accent/5 backdrop-blur-sm shadow-glass scale-[1.02]"
            : "border-border/50 bg-background-paper/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-glass"
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragging || isDragActive ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="mx-auto mb-6 w-20 h-20 md:w-24 md:h-24 p-5 bg-background rounded-2xl border shadow-card"
        >
          <UploadCloud className="w-full h-full text-primary group-hover:text-accent transition-colors" />
        </motion.div>
        <AnimatePresence mode="wait">
          {(isDragActive || isDragging) ? (
            <motion.p
              key="drag"
              className="text-2xl font-bold text-accent mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Drop your images here...
            </motion.p>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Drag & drop up to 5 images
              </p>
              <p className="text-foreground-secondary mb-8 text-lg">
                or click to browse. JPEG, PNG, WebP (max 10MB each)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Previous Results Button */}
      {hasPrevious && (
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            className="btn inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-2xl text-lg font-medium shadow-card hover:shadow-glass"
            onClick={() => {
              const saved = JSON.parse(localStorage.getItem("photoResults"));
              navigate(`/results/${saved.sessionId}`);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-5 h-5" />
            View Previous Results
          </motion.button>
        </motion.div>
      )}

      {/* Selected Files Preview - Staggered grid */}
      {files.length > 0 && (
        <motion.div 
          className="mt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Selected Files ({files.length}/5)
          </h2>
          <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {files.map((f, i) => {
              const fileStatus = fileStatuses.find(fs => fs.name === f.name)?.status || 'selected';
              const getStatusIcon = () => {
                switch (fileStatus) {
                  case 'uploading':
                    return <Loader className="w-6 h-6 text-primary animate-spin" />;
                  case 'processing':
                    return <Clock className="w-6 h-6 text-accent animate-spin" />;
                  case 'completed':
                    return <CheckCircle className="w-6 h-6 text-success" />;
                  case 'error':
                    return <ArrowLeft className="w-6 h-6 text-error rotate-180" />;
                  default:
                    return <ImageIcon className="w-6 h-6 text-primary" />;
                }
              };
              const getStatusColor = () => {
                switch (fileStatus) {
                  case 'uploading':
                    return 'border-primary/50 bg-primary/5';
                  case 'processing':
                    return 'border-accent/50 bg-accent/5';
                  case 'completed':
                    return 'border-success/50 bg-success/5';
                  case 'error':
                    return 'border-error/50 bg-error/5';
                  default:
                    return 'border-border hover:border-primary bg-background-paper';
                }
              };
              return (
                <motion.div
                  key={i}
                  className={`group relative p-4 rounded-2xl border hover:shadow-card transition-all duration-200 overflow-hidden ${getStatusColor()}`}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    {getStatusIcon()}
                  </div>
                  <p className="font-medium truncate">{f.name}</p>
                  <p className="text-foreground-secondary text-sm">
                    {Math.round(f.size / 1024)} KB
                  </p>
                  <p className="text-xs capitalize text-foreground-muted mt-1">
                    {fileStatus}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Progress Indicators */}
      {status === "uploading" && (
        <motion.div
          className="mt-12 max-w-md mx-auto glass p-6 sm:p-8 rounded-3xl shadow-glass"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Uploading Files</h3>
          </div>
          <p className="text-sm text-foreground-secondary mb-4 text-center">
            Uploading {files.length} image{files.length !== 1 ? 's' : ''}...
          </p>
          <div className="w-full bg-border rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full shimmer"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-center font-mono text-foreground-secondary">{uploadProgress.toFixed(0)}%</p>
        </motion.div>
      )}

      {status === "processing" && (
        <motion.div
          className="mt-12 max-w-md mx-auto glass p-6 sm:p-8 rounded-3xl shadow-glass"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center animate-spin">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Processing Images</h3>
          </div>
          <p className="text-sm text-foreground-secondary mb-4 text-center">
            Removing metadata from {progress.total} image{progress.total !== 1 ? 's' : ''}...
          </p>
          <p className="text-lg mb-4 text-center">{progress.processed}/{progress.total} completed</p>
          <div className="w-full bg-border rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              className="bg-accent h-3 rounded-full shimmer"
              animate={{ width: progress.total > 0 ? `${(progress.processed / progress.total) * 100}%` : 0 }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </motion.div>
      )}

        {status === "completed" && (
          <>
            {/* Completion message */}
            <motion.div
              ref={(el) => {
                if (el && status === "completed") {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="max-w-md mx-auto glass p-8 rounded-3xl shadow-glass text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-20 h-20 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-success mb-4">Processing Complete!</h3>
              <p className="text-foreground-secondary mb-8">Navigate to Results</p>
              <motion.button
                className="btn flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-card hover:shadow-glass"
                onClick={() => navigate(`/results/${sessionId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-5 h-5" />
                View Results
              </motion.button>
            </motion.div>
          </>
        )}

      {status === "error" && (
        <motion.div 
          className="mt-12 max-w-md mx-auto glass p-8 rounded-3xl shadow-glass text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-20 h-20 bg-error/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="w-10 h-10 text-error rotate-180" />
          </div>
          <h3 className="text-2xl font-bold text-error mb-4">Upload Failed</h3>
          <p className="text-foreground-secondary mb-8">Please try again.</p>
          <motion.button
            className="btn w-full bg-foreground text-background py-4 px-8 rounded-2xl text-lg font-semibold hover:shadow-glass"
            onClick={() => setStatus("idle")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      )}

      {/* Theme Toggle - Floating top-right */}
      <motion.button
        className="fixed top-6 right-6 p-3 bg-background-paper/80 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/50 transition-all duration-200 z-50"
        onClick={onToggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6 text-accent" /> : <Moon className="w-6 h-6 text-primary" />}
      </motion.button>

      {/* Footer */}
      <footer className="mt-24 text-center text-foreground-secondary text-sm pt-12 border-t border-border/50">
        <p>
          Created by{" "}
          <Link to="https://alfred-delacosta.github.io" className="text-primary hover:underline">
            Alfred De La Costa
          </Link>{" "}
          with help from{" "}
          <Link to="https://x.ai/" className="text-primary hover:underline">
            Grok
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default FileUpload;
