import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Image as ImageIcon,
  Eye,
  Clock,
  Download,
  XCircle,
  CheckCircle,
  Loader,
  ShieldCheck,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";
import SiteFooter from "./SiteFooter";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"]
};

const PRESETS = [
  { id: "low", label: "Low", hint: "1280x720, quality 70" },
  { id: "medium", label: "Medium", hint: "1920x1080, quality 85" },
  { id: "high", label: "High", hint: "3840x2160, quality 95" },
  { id: "orig", label: "Original", hint: "No resize, quality 100" }
];

const FORMATS = [
  { id: "jpeg", label: "JPEG" },
  { id: "webp", label: "WebP" }
];

/**
 * Upload home: choose preset/format, review selected files, then strip and compress.
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
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const busy = status === "uploading" || status === "processing";
  const selectedPreset = PRESETS.find((p) => p.id === preset);

  const handleUpload = useCallback(
    async (filesToUpload) => {
      if (!filesToUpload || filesToUpload.length === 0) return;

      setStatus("uploading");
      setUploadProgress(0);
      setFileStatuses(filesToUpload.map((file) => ({ name: file.name, status: "uploading" })));
      toast("Uploading images...", { duration: 2000 });

      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append("files", file));
      formData.append("preset", preset);
      formData.append("format", format);

      try {
        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const next = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(next);
          }
        });

        if (!res.data.sessionId || !res.data.expTime) {
          throw new Error("Invalid response");
        }
        const expTimeNum = Number(res.data.expTime);
        if (Number.isNaN(expTimeNum)) {
          throw new Error("Invalid expTime");
        }

        setSessionId(res.data.sessionId);
        localStorage.setItem(
          "photoResults",
          JSON.stringify({
            sessionId: res.data.sessionId,
            expTime: expTimeNum
          })
        );
        setStatus("processing");
        setFileStatuses(filesToUpload.map((file) => ({ name: file.name, status: "processing" })));
        toast.success("Upload received. Confirming results...");
      } catch (error) {
        console.error("Upload error:", error);
        setStatus("error");
        setUploadProgress(0);
        setFileStatuses(filesToUpload.map((file) => ({ name: file.name, status: "error" })));
        const message =
          error?.response?.data?.error ||
          error?.message ||
          "Upload Error!";
        toast.error(message);
      }
    },
    [preset, format]
  );

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (busy) return;

      if (rejectedFiles?.length) {
        const tooLarge = rejectedFiles.some((r) =>
          r.errors?.some((e) => e.code === "file-too-large")
        );
        const invalidType = rejectedFiles.some((r) =>
          r.errors?.some((e) => e.code === "file-invalid-type")
        );
        if (tooLarge) toast.error("Each file must be 10MB or smaller.");
        else if (invalidType) toast.error("Only JPEG, PNG, WebP, and HEIC are allowed.");
        else toast.error("Some files were rejected.");
      }

      if (!acceptedFiles.length) return;

      if (acceptedFiles.length > 5) {
        toast.error("Only 5 images allowed.");
        return;
      }

      const limitedFiles = acceptedFiles.slice(0, 5);
      setFiles(limitedFiles);
      setFileStatuses(limitedFiles.map((file) => ({ name: file.name, status: "selected" })));
      setStatus("ready");
      setSessionId(null);
      setProgress({ processed: 0, total: 0 });
    },
    [busy]
  );

  const clearSelection = () => {
    setFiles([]);
    setFileStatuses([]);
    setStatus("idle");
    setUploadProgress(0);
    setSessionId(null);
  };

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
      try {
        const { expTime } = JSON.parse(saved);
        if (Date.now() < expTime) {
          setHasPrevious(true);
        } else {
          localStorage.removeItem("photoResults");
        }
      } catch {
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
          setFileStatuses((prev) =>
            prev.map((f, index) => ({
              ...f,
              status: index < res.data.processed ? "completed" : "processing"
            }))
          );
          if (res.data.processed === res.data.total) {
            setStatus("completed");
            setFileStatuses((prev) => prev.map((f) => ({ ...f, status: "completed" })));
            toast.success("Your images are ready.");
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
    onDropRejected: () => {},
    multiple: true,
    maxFiles: 5,
    maxSize: MAX_FILE_BYTES,
    accept: ACCEPT,
    disabled: busy,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  const rootProps = getRootProps();

  return (
    <div className="safe-page min-h-screen min-h-[100dvh] flex flex-col max-w-6xl mx-auto">
      <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />

      <main id="main-content" className="flex-1 flex flex-col justify-center">
        <motion.div
          className="text-center mb-6 md:mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-medium text-foreground-secondary mb-2 md:mb-3 tracking-wide">
            Privacy-first image tools
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-3 md:mb-4">
            Photo Metadata Remover
          </h1>
          <p className="text-base md:text-xl text-foreground-secondary max-w-2xl mx-auto">
            Strip EXIF metadata and compress photos so they are easier and safer to share. Up to 5
            images, available for {expirationTime} minutes.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-center mb-6 md:mb-8 max-w-2xl mx-auto w-full">
          <div className="flex-1">
            <div
              role="radiogroup"
              aria-label="Resize preset"
              className="flex gap-1 flex-wrap"
            >
              <span className="w-full block text-sm font-medium mb-2 text-foreground-secondary">
                Preset
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={preset === p.id}
                  disabled={busy}
                  className={`focus-ring px-4 py-3 rounded-control border-2 transition-colors btn font-medium text-sm whitespace-nowrap disabled:opacity-50 ${
                    preset === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-card"
                      : "border-border hover:border-primary/50 text-foreground-secondary hover:text-foreground"
                  }`}
                  onClick={() => setPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {selectedPreset && (
              <p className="mt-2 text-xs text-foreground-muted">{selectedPreset.hint}</p>
            )}
          </div>
          <div className="flex-1">
            <div role="radiogroup" aria-label="Output format" className="flex gap-1 flex-wrap">
              <span className="w-full block text-sm font-medium mb-2 text-foreground-secondary">
                Format
              </span>
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={format === f.id}
                  disabled={busy}
                  className={`focus-ring px-4 py-3 rounded-control border-2 transition-colors btn font-medium text-sm whitespace-nowrap disabled:opacity-50 ${
                    format === f.id
                      ? "bg-primary text-primary-foreground border-primary shadow-card"
                      : "border-border hover:border-primary/50 text-foreground-secondary hover:text-foreground"
                  }`}
                  onClick={() => setFormat(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          {...rootProps}
          role="button"
          tabIndex={0}
          aria-label="Upload images. Drag and drop up to 5 images, or click to browse."
          aria-disabled={busy}
          className={`relative group border-2 border-dashed rounded-card p-6 sm:p-12 md:p-16 text-center transition-colors focus-ring ${
            busy ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          } ${
            isDragging || isDragActive
              ? "border-accent bg-accent/5"
              : "border-border/60 bg-background-paper hover:border-primary/50"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <input {...getInputProps()} aria-label="Choose image files" />
          <div className="mx-auto mb-3 md:mb-6 w-14 h-14 md:w-24 md:h-24 p-3 md:p-5 bg-background rounded-card border border-border shadow-card">
            <UploadCloud className="w-full h-full text-primary group-hover:text-accent transition-colors" aria-hidden="true" />
          </div>
          <AnimatePresence mode="wait">
            {isDragActive || isDragging ? (
              <motion.p
                key="drag"
                className="text-lg md:text-2xl font-bold text-accent mb-2 md:mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Drop your images here
              </motion.p>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-foreground mb-1 md:mb-3">
                  <span className="sm:hidden">Tap to choose photos</span>
                  <span className="hidden sm:inline">Drag and drop up to 5 images</span>
                </p>
                <p className="text-foreground-secondary text-sm md:text-lg">
                  <span className="sm:hidden">Up to 5 images. JPEG, PNG, WebP, HEIC (max 10MB each)</span>
                  <span className="hidden sm:inline">or click to browse. JPEG, PNG, WebP, HEIC (max 10MB each)</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {hasPrevious && status === "idle" && files.length === 0 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              className="btn focus-ring inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-card text-lg font-medium shadow-card"
              onClick={() => {
                const saved = JSON.parse(localStorage.getItem("photoResults"));
                navigate(`/results/${saved.sessionId}`);
              }}
            >
              <Eye className="w-5 h-5" aria-hidden="true" />
              View previous results
            </button>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-10 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Selected files ({files.length}/5)
            </h2>
            <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {files.map((f, i) => {
                const fileStatus = fileStatuses.find((fs) => fs.name === f.name)?.status || "selected";
                const getStatusIcon = () => {
                  switch (fileStatus) {
                    case "uploading":
                      return <Loader className="w-6 h-6 text-primary animate-spin" aria-hidden="true" />;
                    case "processing":
                      return <Clock className="w-6 h-6 text-accent" aria-hidden="true" />;
                    case "completed":
                      return <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />;
                    case "error":
                      return <XCircle className="w-6 h-6 text-error" aria-hidden="true" />;
                    default:
                      return <ImageIcon className="w-6 h-6 text-primary" aria-hidden="true" />;
                  }
                };
                const getStatusColor = () => {
                  switch (fileStatus) {
                    case "uploading":
                      return "border-primary/50 bg-primary/5";
                    case "processing":
                      return "border-accent/50 bg-accent/5";
                    case "completed":
                      return "border-success/50 bg-success/5";
                    case "error":
                      return "border-error/50 bg-error/5";
                    default:
                      return "border-border hover:border-primary bg-background-paper";
                  }
                };
                return (
                  <div
                    key={`${f.name}-${i}`}
                    className={`relative p-4 rounded-card border transition-colors overflow-hidden ${getStatusColor()}`}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-control flex items-center justify-center mb-2">
                      {getStatusIcon()}
                    </div>
                    <p className="font-medium truncate">{f.name}</p>
                    <p className="text-foreground-secondary text-sm">{Math.round(f.size / 1024)} KB</p>
                    <p className="text-xs capitalize text-foreground-muted mt-1">{fileStatus}</p>
                  </div>
                );
              })}
            </div>

            {status === "ready" && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  className="btn focus-ring inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card"
                  onClick={() => handleUpload(files)}
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  Remove metadata and compress
                </button>
                <button
                  type="button"
                  className="btn focus-ring inline-flex items-center gap-2 px-6 py-4 border border-border rounded-card text-foreground-secondary hover:text-foreground"
                  onClick={clearSelection}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}

        {status === "uploading" && (
          <div className="mt-10 max-w-md mx-auto glass p-6 sm:p-8 rounded-card shadow-glass" role="status" aria-live="polite">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-control flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Uploading</h3>
            </div>
            <p className="text-sm text-foreground-secondary mb-4 text-center">
              Sending {files.length} image{files.length !== 1 ? "s" : ""} to the server...
            </p>
            <div className="w-full bg-border rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-[width] duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center font-mono text-foreground-secondary">{uploadProgress.toFixed(0)}%</p>
          </div>
        )}

        {status === "processing" && (
          <div className="mt-10 max-w-md mx-auto glass p-6 sm:p-8 rounded-card shadow-glass" role="status" aria-live="polite">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-control flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Confirming results</h3>
            </div>
            <p className="text-sm text-foreground-secondary mb-4 text-center">
              Checking that metadata was removed
              {progress.total > 0 ? ` from ${progress.total} image${progress.total !== 1 ? "s" : ""}` : ""}...
            </p>
            <p className="text-lg mb-4 text-center">
              {progress.processed}/{progress.total || files.length} ready
            </p>
            <div className="w-full bg-border rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-accent h-3 rounded-full transition-[width] duration-300"
                style={{
                  width:
                    progress.total > 0
                      ? `${(progress.processed / progress.total) * 100}%`
                      : "0%"
                }}
              />
            </div>
          </div>
        )}

        {status === "completed" && (
          <div
            ref={(el) => {
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="mt-10 max-w-md mx-auto glass p-8 rounded-card shadow-glass text-center"
          >
            <div className="w-20 h-20 bg-success/20 rounded-card flex items-center justify-center mx-auto mb-6">
              <Download className="w-10 h-10 text-success" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold text-success mb-4">Processing complete</h3>
            <p className="text-foreground-secondary mb-8">
              Metadata removed. Files are ready to download and share.
            </p>
            <button
              type="button"
              className="btn focus-ring flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card w-full"
              onClick={() => navigate(`/results/${sessionId}`)}
            >
              <Eye className="w-5 h-5" aria-hidden="true" />
              View results
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-10 max-w-md mx-auto glass p-8 rounded-card shadow-glass text-center" role="alert">
            <div className="w-20 h-20 bg-error/20 rounded-card flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-error" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold text-error mb-4">Upload failed</h3>
            <p className="text-foreground-secondary mb-8">Please try again.</p>
            <button
              type="button"
              className="btn focus-ring w-full bg-foreground text-background py-4 px-8 rounded-card text-lg font-semibold"
              onClick={clearSelection}
            >
              Try again
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default FileUpload;
