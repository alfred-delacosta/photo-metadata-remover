import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, AlertCircle, ShieldCheck, Images } from "lucide-react";
import ImgMediaCard from "../components/ImgMediaCard";
import ThemeToggle from "../components/ThemeToggle";
import BrandMark from "../components/BrandMark";
import SiteFooter from "../components/SiteFooter";
import api from "../lib/axios";

/**
 * Results gallery: metadata-stripped, resized images for a session.
 */
const Results = ({ isDark, onToggleTheme }) => {
  const { sessionId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expTime, setExpTime] = useState(0);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get(`/session/${sessionId}`);
        setFiles(res.data.files || []);
        setExpTime(Number(res.data.expTime) || 0);
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    poll();
    const int = setInterval(poll, 10000);
    return () => clearInterval(int);
  }, [sessionId]);

  useEffect(() => {
    if (expTime > 0) {
      localStorage.setItem("photoResults", JSON.stringify({ sessionId, expTime }));
    }
  }, [sessionId, expTime]);

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] py-20 px-4 flex flex-col items-center justify-center">
        <BrandMark />
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <div
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"
          role="status"
          aria-label="Loading results"
        />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Loading results...</h2>
        <p className="text-foreground-secondary">Just a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-h-[100dvh] py-20 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <BrandMark />
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <div className="w-28 h-28 bg-error/10 rounded-card flex items-center justify-center mx-auto mb-8 border border-error/20">
          <AlertCircle className="w-16 h-16 text-error" aria-hidden="true" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Results unavailable
        </h1>
        <p className="text-lg text-foreground-secondary mb-8 max-w-sm">
          This session may have expired or the link is invalid. Upload new images to continue.
        </p>
        <button
          className="btn focus-ring flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card"
          onClick={() => navigate("/")}
          type="button"
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          Go to homepage
        </button>
        <SiteFooter className="w-full mt-16" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen min-h-[100dvh] py-20 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <BrandMark />
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <div className="w-28 h-28 bg-background-elevated rounded-card flex items-center justify-center mx-auto mb-8 border border-border">
          <Images className="w-16 h-16 text-foreground-secondary" aria-hidden="true" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">No images yet</h1>
        <p className="text-lg text-foreground-secondary mb-8">
          This session has no processed files. Upload images to get started.
        </p>
        <button
          className="btn focus-ring flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card"
          onClick={() => navigate("/")}
          type="button"
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          Back to upload
        </button>
        <SiteFooter className="w-full mt-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] py-20 px-4 sm:px-6 lg:px-8 flex flex-col">
      <BrandMark />
      <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />

      <main id="main-content" className="flex-1">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-display text-2xl md:text-3xl font-semibold text-primary mb-3">
            Photo Metadata Remover
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Ready to share
          </h1>
          <p className="text-xl text-foreground-secondary mb-4">
            {files.length} image{files.length !== 1 ? "s" : ""} processed
          </p>
          <p className="inline-flex items-center gap-2 text-success font-medium bg-success/10 px-4 py-2 rounded-card">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            Metadata removed and files compressed for safer sharing
          </p>
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 lg:gap-10 max-w-7xl mx-auto mb-16">
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div
                key={`${file.filename || file.origName}-${i}`}
                className="mb-4 sm:mb-6 lg:mb-10 break-inside-avoid"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.24), duration: 0.3 }}
                layout
              >
                <ImgMediaCard file={file} isResults={true} expTime={expTime} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mb-8">
          <button
            className="btn focus-ring flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-card text-lg font-semibold shadow-card mx-auto"
            onClick={() => navigate("/")}
            type="button"
          >
            <Home className="w-6 h-6" aria-hidden="true" />
            Back to upload
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Results;
