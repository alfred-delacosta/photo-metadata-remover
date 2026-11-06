import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Download,
  Clock,
  Maximize2,
  Settings,
  ChevronLeft,
  Info
} from "lucide-react";
import api from "../lib/axios";
import { downloadImage } from "../lib/downloadImage";
import Countdown from "react-countdown";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";
import BrandMark from "../components/BrandMark";
import SiteFooter from "../components/SiteFooter";

const PRESETS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "orig", label: "Original" }
];

/**
 * Full-screen viewer with reprocess controls.
 * Keeps the latest access token in state after each reprocess.
 */
const ViewImage = ({ isDark, onToggleTheme }) => {
  const { filename } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get("token");
  const [activeToken, setActiveToken] = useState(initialToken);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [linkCountdown, setLinkCountdown] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({
    preset: "",
    format: "",
    origSize: 0,
    newSize: 0,
    origName: ""
  });
  const [preset, setPreset] = useState("medium");
  const [format, setFormat] = useState("jpeg");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [reprocessing, setReprocessing] = useState(false);
  const [isDesktopPanel, setIsDesktopPanel] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );
  const imageRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event) => setIsDesktopPanel(event.matches);
    setIsDesktopPanel(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setActiveToken(initialToken);
  }, [initialToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [urlRes, nameRes, countRes, detailsRes] = await Promise.all([
          api.get(`/imageUrl?token=${activeToken}`),
          api.get(`/imageName?token=${activeToken}`),
          api.get(`/countdown?token=${activeToken}`),
          api.get(`/imageDetails?token=${activeToken}`)
        ]);
        setImageUrl(urlRes.data);
        setImageName(nameRes.data);
        setLinkCountdown(countRes.data);
        setDetails(detailsRes.data);
        if (detailsRes.data.preset) setPreset(detailsRes.data.preset);
        if (detailsRes.data.format) {
          setFormat(String(detailsRes.data.format).toLowerCase());
        }
      } catch {
        toast.error("Image not found");
        setImageUrl("");
      } finally {
        setLoading(false);
      }
    };
    if (filename && activeToken) {
      setLoading(true);
      fetchData();
    }
  }, [filename, activeToken]);

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await api.post(`/reprocess?token=${activeToken}`, { preset, format });
      const nextToken = res.data.token;
      const nextUrl = res.data.url;
      const nextFilename =
        typeof nextUrl === "string"
          ? nextUrl.split("/").pop()?.split("?")[0]
          : filename;

      setActiveToken(nextToken);
      setImageUrl(nextUrl);
      setDetails((prev) => ({
        ...prev,
        preset: res.data.preset,
        format: String(res.data.format).toUpperCase(),
        newSize: res.data.newSize
      }));
      setPreset(res.data.preset);
      setFormat(res.data.format);

      if (nextFilename && nextToken) {
        navigate(`/viewImage/${nextFilename}?token=${nextToken}`, { replace: true });
      }
      toast.success("Reprocessed successfully");
    } catch {
      toast.error("Reprocess failed");
    } finally {
      setReprocessing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        toggleButtonRef.current?.focus();
      }
      if ((e.key === "d" || e.key === "D") && imageUrl && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = e.target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
        downloadImage(imageUrl, imageName);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageUrl, imageName]);

  useEffect(() => {
    if (sidebarOpen) {
      const firstFocusable = sidebarRef.current?.querySelector("button, [href], input");
      firstFocusable?.focus();
    }
  }, [sidebarOpen]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center">
        <BrandMark />
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"
            role="status"
            aria-label="Loading image"
          />
          <p className="text-xl text-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col px-4">
        <BrandMark />
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 bg-border/20 rounded-card flex items-center justify-center mx-auto mb-8">
              <Maximize2 className="w-20 h-20 text-foreground-secondary opacity-50" aria-hidden="true" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">Image not found</h1>
            <button
              className="btn focus-ring px-8 py-4 bg-primary text-primary-foreground rounded-card text-lg"
              onClick={() => window.history.back()}
              type="button"
            >
              Go back
            </button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background overflow-hidden relative">
      <BrandMark />
      <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />

      <motion.div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        style={{ transform: `scale(${imageScale})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-[90vh] object-contain rounded-card shadow-card"
        />
      </motion.div>

      <p className="fixed safe-fixed-bottom-left z-40 text-xs text-foreground-secondary bg-background-paper/90 border border-border rounded-control px-3 py-2 backdrop-blur-sm hidden lg:block">
        Esc closes panel. D downloads.
      </p>

      <p className="fixed safe-fixed-bottom-center left-1/2 -translate-x-1/2 z-40 text-xs text-foreground-muted hidden sm:block">
        Copyright (c) {new Date().getFullYear()} Advanced Software and AI Solutions LLC
      </p>

      <button
        className="fixed safe-fixed-bottom-right p-4 min-w-11 min-h-11 flex items-center justify-center bg-primary/95 backdrop-blur-sm rounded-card shadow-glass border border-primary text-primary-foreground hover:bg-primary z-50 focus-ring"
        onClick={() => downloadImage(imageUrl, imageName)}
        aria-label={`Download ${imageName || "image"} (D)`}
        type="button"
      >
        <Download className="w-6 h-6" aria-hidden="true" />
      </button>

      <button
        ref={toggleButtonRef}
        className={`fixed z-50 min-w-11 min-h-11 flex items-center justify-center bg-background-paper/90 backdrop-blur-sm rounded-card border border-border hover:border-primary/50 shadow-card focus-ring ${
          isDesktopPanel
            ? "top-1/2 left-4 -translate-y-1/2 p-3"
            : "safe-fixed-bottom-left p-3"
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-controls="image-details-panel"
        aria-label={sidebarOpen ? "Close details panel" : "Open details panel"}
        type="button"
      >
        {isDesktopPanel ? (
          <ChevronLeft className={`w-6 h-6 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        ) : (
          <Info className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      <motion.aside
        id="image-details-panel"
        ref={sidebarRef}
        className={`fixed z-40 bg-background-paper/95 backdrop-blur-xl shadow-glass overflow-y-auto safe-panel-pad ${
          isDesktopPanel
            ? "right-0 top-0 h-full w-80 lg:w-96 border-l border-border/50 p-8"
            : "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-card border-t border-border/50 p-6 pt-4"
        }`}
        animate={
          isDesktopPanel
            ? { x: sidebarOpen ? 0 : "100%", y: 0 }
            : { y: sidebarOpen ? 0 : "100%", x: 0 }
        }
        initial={isDesktopPanel ? { x: "100%", y: 0 } : { y: "100%", x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-hidden={!sidebarOpen}
      >
        {!isDesktopPanel && (
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />
        )}
        <div className="sticky top-0 pb-6 lg:pb-8 border-b border-border/50 mb-6 lg:mb-8 bg-background-paper/95">
          <h2 className="font-display text-xl lg:text-2xl font-bold text-primary mb-2">
            {imageName}
          </h2>
          <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-4">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <Countdown
              date={linkCountdown}
              renderer={({ hours, minutes, seconds }) => (
                <span className="font-mono">
                  {hours}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </span>
              )}
            />
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" aria-hidden="true" />
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-foreground-secondary">Preset:</span> {details.preset}
              </p>
              <p>
                <span className="text-foreground-secondary">Format:</span> {details.format}
              </p>
              <p>
                <span className="text-foreground-secondary">Size:</span>{" "}
                {Math.round(details.origSize / 1024)} KB → {Math.round(details.newSize / 1024)} KB
                <br />
                <span
                  className={`font-bold ${
                    details.origSize > 0 ? "text-success" : "text-foreground-secondary"
                  }`}
                >
                  {details.origSize > 0
                    ? `${Math.round((1 - details.newSize / details.origSize) * 100)}% smaller`
                    : "N/A"}
                </span>
              </p>
              <p className="text-success font-medium">Metadata removed</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" aria-hidden="true" />
            Reprocess
          </h3>
          <p className="text-xs text-foreground-secondary mb-4 flex items-start gap-2 bg-background-elevated rounded-card p-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            Reprocess works from the already-processed file. Extra passes can reduce quality
            further. Prefer the original upload for a fresh encode when possible.
          </p>
          <div role="radiogroup" aria-label="Resize preset" className="grid grid-cols-2 gap-2 mb-6">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`focus-ring p-3 rounded-control border-2 font-medium text-sm transition-colors btn ${
                  preset === p.id
                    ? "bg-primary text-primary-foreground border-primary shadow-card"
                    : "border-border hover:border-primary/50 text-foreground-secondary"
                }`}
                onClick={() => setPreset(p.id)}
                role="radio"
                aria-checked={preset === p.id}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div role="radiogroup" aria-label="Output format" className="grid grid-cols-2 gap-2 mb-6">
            {["jpeg", "webp"].map((f) => (
              <button
                key={f}
                className={`focus-ring p-3 rounded-control border-2 font-medium text-sm transition-colors btn ${
                  format === f
                    ? "bg-primary text-primary-foreground border-primary shadow-card"
                    : "border-border hover:border-primary/50 text-foreground-secondary"
                }`}
                onClick={() => setFormat(f)}
                role="radio"
                aria-checked={format === f}
                type="button"
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="w-full btn focus-ring bg-primary text-primary-foreground py-4 px-6 rounded-card text-lg font-semibold shadow-card disabled:opacity-60"
            onClick={handleReprocess}
            disabled={reprocessing}
            type="button"
          >
            {reprocessing ? "Reprocessing..." : "Reprocess image"}
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-30 cursor-default"
          aria-label="Close details panel"
          onClick={() => {
            setSidebarOpen(false);
            toggleButtonRef.current?.focus();
          }}
        />
      )}
    </div>
  );
};

export default ViewImage;
