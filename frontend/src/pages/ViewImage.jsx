import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { 
  Download, 
  Clock, 
  Maximize2, 
  Settings, 
  ChevronLeft 
} from "lucide-react";
import api from "../lib/axios";
import Countdown from "react-countdown";
import toast from "react-hot-toast";

/**
 * Cinematic ViewImage Page - Full-Screen Viewer with Sidebar
 * 
 * Transformed into a premium image viewer:
 * - Full-bleed image with zoom/pan support (via CSS + pointer events)
 * - Slide-in sidebar for details and reprocess controls
 * - Keyboard shortcuts (ESC to toggle sidebar, D for download)
 * - Segmented controls for reprocessing
 * - Responsive: Sidebar stacks on mobile, image adapts
 * 
 * Why cinematic? Immersive full-screen with subtle controls.
 * Hover/keyboard interactions feel native-app like (Tesla dashboard vibe).
 */
const ViewImage = () => {
  const { filename } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [linkCountdown, setLinkCountdown] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({ preset: '', format: '', origSize: 0, newSize: 0, origName: '' });
  const [preset, setPreset] = useState("medium");
  const [format, setFormat] = useState("jpeg");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [urlRes, nameRes, countRes, detailsRes] = await Promise.all([
          api.get(`/imageUrl?token=${token}`),
          api.get(`/imageName?token=${token}`),
          api.get(`/countdown?token=${token}`),
          api.get(`/imageDetails?token=${token}`),
        ]);
        setImageUrl(urlRes.data);
        setImageName(nameRes.data);
        setLinkCountdown(countRes.data);
        setDetails(detailsRes.data);
      } catch {
        toast.error("Image not found");
      } finally {
        setLoading(false);
      }
    };
    if (filename && token) fetchData();
  }, [filename, token]);

  const handleReprocess = async () => {
    try {
      const res = await api.post(`/reprocess?token=${token}`, { preset, format });
      setImageUrl(res.data.url);
      setDetails(prev => ({
        ...prev,
        preset: res.data.preset,
        format: res.data.format.toUpperCase(),
        newSize: res.data.newSize
      }));
      setPreset(res.data.preset);
      setFormat(res.data.format);
      toast.success("Reprocessed successfully");
    } catch {
      toast.error("Reprocess failed");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
      if (e.key === "d" || e.key === "D") {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = imageName;
        link.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageUrl, imageName]);

  // Simple zoom/pan with mouse
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl text-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-border/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Maximize2 className="w-20 h-20 text-foreground-secondary opacity-50" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Image Not Found</h1>
          <motion.button
            className="btn px-8 py-4 bg-primary text-primary-foreground rounded-3xl text-lg"
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.05 }}
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Full-screen Image Viewer */}
      <motion.div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center p-8 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
        onWheel={handleWheel}
        style={{ transform: `scale(${imageScale})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl max-h-[90vh]"
        />
      </motion.div>

      {/* Floating Download Button */}
      <motion.button
        className="fixed bottom-8 right-8 p-4 bg-primary/95 backdrop-blur-sm rounded-3xl shadow-glass border text-primary-foreground hover:bg-primary z-50"
        onClick={() => {
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = imageName;
          link.click();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Download (D key)"
      >
        <Download className="w-6 h-6" />
      </motion.button>

      {/* Sidebar Toggle Button */}
      <motion.button
        className="fixed top-1/2 left-4 -translate-y-1/2 p-3 bg-background-paper/90 backdrop-blur-sm rounded-2xl border hover:border-primary/50 z-50 shadow-card"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Details (ESC)"
      >
        <ChevronLeft className={`w-6 h-6 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Slide-in Sidebar */}
      <motion.aside
        className="fixed right-0 top-0 h-full w-80 lg:w-96 bg-background-paper/95 backdrop-blur-xl border-l border-border/50 shadow-glass p-8 overflow-y-auto z-40"
        animate={{ x: sidebarOpen ? 0 : "100%" }}
        initial={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="sticky top-0 pb-8 border-b border-border/50 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {imageName}
          </h2>
          <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-4">
            <Clock className="w-4 h-4" />
            <Countdown 
              date={linkCountdown} 
              renderer={({ hours, minutes, seconds }) => (
                <span className="font-mono">{hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
              )} 
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-foreground-secondary">Preset:</span> {details.preset}</p>
              <p><span className="text-foreground-secondary">Format:</span> {details.format}</p>
              <p>
                <span className="text-foreground-secondary">Size:</span> {Math.round(details.origSize / 1024)} KB →{" "}
                {Math.round(details.newSize / 1024)} KB
                <br />
                <span className={`font-bold ${details.origSize > 0 ? 'text-success' : 'text-foreground-secondary'}`}>
                  {details.origSize > 0 ? `${Math.round((1 - details.newSize / details.origSize) * 100)}% smaller` : 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Reprocess Controls */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reprocess
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {["low", "medium", "high", "orig"].map((p) => (
              <motion.button
                key={p}
                className={`p-3 rounded-xl border-2 font-medium text-sm transition-all btn ${
                  preset === p
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "border-border hover:border-primary/50 text-foreground-secondary"
                }`}
                onClick={() => setPreset(p)}
                whileHover={{ scale: 1.02 }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {["jpeg", "webp"].map((f) => (
              <motion.button
                key={f}
                className={`p-3 rounded-xl border-2 font-medium text-sm transition-all btn ${
                  format === f
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "border-border hover:border-primary/50 text-foreground-secondary"
                }`}
                onClick={() => setFormat(f)}
                whileHover={{ scale: 1.02 }}
              >
                {f.toUpperCase()}
              </motion.button>
            ))}
          </div>
          <motion.button
            className="w-full btn bg-gradient-to-r from-primary to-accent text-primary-foreground py-4 px-6 rounded-2xl text-lg font-semibold shadow-card hover:shadow-glass"
            onClick={handleReprocess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reprocess Image
          </motion.button>
        </div>
      </motion.aside>

      {/* Overlay when sidebar open */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ViewImage;
