import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // JSX only
import { 
  Download, 
  Clock, 
  Maximize2, 
  Settings, 
  ChevronLeft,
  RotateCcw
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
  const [imageTranslate, setImageTranslate] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Pointer tracking for pan + pinch (mouse + touch, no extra deps)
  const pointersRef = useRef(new Map());
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef(null); // { startDist, startScale }

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
      if (e.key.toLowerCase() === "r") {
        resetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageUrl, imageName, resetZoom]);

  // Simple zoom/pan with mouse
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageScale(prev => {
      const next = Math.max(0.5, Math.min(3, prev * delta));
      if (next === 1) setImageTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Pointer down (mouse or touch) - start pan or pinch
  const handlePointerDown = useCallback((e) => {
    if (!imageRef.current) return;
    imageRef.current.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1 && imageScale > 1) {
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointersRef.current.size === 2) {
      // Begin pinch
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { startDist: dist, startScale: imageScale };
      isPanningRef.current = false;
    }
  }, [imageScale]);

  const handlePointerMove = useCallback((e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / pinchRef.current.startDist;
      const nextScale = Math.max(0.5, Math.min(3, pinchRef.current.startScale * ratio));
      setImageScale(nextScale);
      if (nextScale === 1) setImageTranslate({ x: 0, y: 0 });
      return;
    }

    if (isPanningRef.current && imageScale > 1) {
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      setImageTranslate(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  }, [imageScale]);

  const handlePointerUp = useCallback((e) => {
    if (imageRef.current && imageRef.current.releasePointerCapture) {
      try { imageRef.current.releasePointerCapture(e.pointerId); } catch { /* release may fail on some browsers; safe to ignore */ }
    }
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      isPanningRef.current = false;
    }
  }, []);

  const resetZoom = useCallback(() => {
    setImageScale(1);
    setImageTranslate({ x: 0, y: 0 });
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
      {/* Full-screen Image Viewer (touch + mouse pan/pinch) */}
      <motion.div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 touch-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={resetZoom}
        style={{
          transform: `translate(${imageTranslate.x}px, ${imageTranslate.y}px) scale(${imageScale})`,
          cursor: imageScale > 1 ? 'grab' : 'default'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl max-h-[90vh] select-none"
          draggable={false}
        />
      </motion.div>

      {/* Zoom controls */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-50 flex flex-col gap-2">
        <button
          onClick={resetZoom}
          className="btn p-2.5 sm:p-3 bg-background-paper/90 backdrop-blur rounded-2xl border border-border hover:border-primary/50 text-foreground-secondary hover:text-foreground"
          title="Reset zoom (double-click or R)"
          aria-label="Reset zoom"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <div className="text-[10px] font-mono text-foreground-muted text-center select-none">
          {Math.round(imageScale * 100)}%
        </div>
      </div>

      {/* Floating Download Button */}
      <motion.button
        className="fixed bottom-8 right-4 sm:right-8 p-3.5 sm:p-4 bg-primary/95 backdrop-blur-sm rounded-3xl shadow-glass border text-primary-foreground hover:bg-primary z-50 min-w-[44px] min-h-[44px]"
        onClick={() => {
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = imageName;
          link.click();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Download (D key)"
        aria-label="Download image"
      >
        <Download className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      {/* Sidebar Toggle Button - larger & thumb-friendly on mobile */}
      <motion.button
        className="fixed top-1/2 left-3 sm:left-4 -translate-y-1/2 p-3 sm:p-3.5 min-w-[44px] min-h-[44px] bg-background-paper/90 backdrop-blur-sm rounded-2xl border hover:border-primary/50 z-50 shadow-card flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileHover={{ scale: 1.05, transformOrigin: "center" }}
        whileTap={{ scale: 0.95, transformOrigin: "center" }}
        title="Toggle Details (ESC)"
        aria-label="Toggle details sidebar"
      >
        <ChevronLeft className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
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
          {/* Quick nav */}
          <div className="flex gap-2">
            <button onClick={() => window.location.href = '/'} className="text-xs px-3 py-1 rounded-xl border border-border hover:border-primary/50 text-foreground-secondary">New upload</button>
            <button onClick={() => window.history.back()} className="text-xs px-3 py-1 rounded-xl border border-border hover:border-primary/50 text-foreground-secondary">Go back</button>
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

        {/* Reprocess Controls (accessible) */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reprocess
          </h3>
          <div role="radiogroup" aria-label="Preset" className="grid grid-cols-2 gap-2 mb-6">
            {["low", "medium", "high", "orig"].map((p) => {
              const isActive = preset === p;
              return (
                <motion.button
                  key={p}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`Preset ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                  className={`p-3 rounded-xl border-2 font-medium text-sm transition-all btn ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "border-border hover:border-primary/50 text-foreground-secondary"
                  }`}
                  onClick={() => setPreset(p)}
                  whileHover={{ scale: 1.02 }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </motion.button>
              );
            })}
          </div>
          <div role="radiogroup" aria-label="Format" className="grid grid-cols-2 gap-2 mb-6">
            {["jpeg", "webp"].map((f) => {
              const isActive = format === f;
              return (
                <motion.button
                  key={f}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`Format ${f.toUpperCase()}`}
                  className={`p-3 rounded-xl border-2 font-medium text-sm transition-all btn ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "border-border hover:border-primary/50 text-foreground-secondary"
                  }`}
                  onClick={() => setFormat(f)}
                  whileHover={{ scale: 1.02 }}
                >
                  {f.toUpperCase()}
                </motion.button>
              );
            })}
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

      {/* Keyboard hints - subtle, bottom-left on desktop, hidden on very small screens */}
      <div className="hidden sm:block fixed bottom-4 left-4 z-40 text-[11px] text-foreground-muted/70 font-mono pointer-events-none">
        D download • R reset zoom • ESC close sidebar
      </div>
    </div>
  );
};

export default ViewImage;
