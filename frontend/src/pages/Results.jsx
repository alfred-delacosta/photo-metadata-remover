import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Loader2, ShieldCheck } from "lucide-react";
import ImgMediaCard from "../components/ImgMediaCard";
import ThemeToggle from "../components/ThemeToggle";
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
      <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center">
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <motion.div
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <h2 className="text-2xl font-bold text-foreground mb-2">Finalizing results...</h2>
        <p className="text-foreground-secondary">Just a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
        <div className="w-32 h-32 bg-error/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-error/20">
          <Loader2 className="w-20 h-20 text-error animate-spin" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-error to-accent bg-clip-text text-transparent mb-6">
          Session Expired
        </h1>
        <p className="text-xl text-foreground-secondary mb-8 max-w-sm">
          The results are no longer available. Please upload new images.
        </p>
        <motion.button
          className="btn flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-3xl text-lg font-semibold shadow-card hover:shadow-glass"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Home className="w-5 h-5" />
          Go to Homepage
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />

      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent mb-4 leading-none pb-2">
          Ready to Share
        </h1>
        <p className="text-2xl md:text-3xl text-foreground-secondary mb-4">
          {files.length} image{files.length !== 1 ? "s" : ""} processed
        </p>
        <p className="inline-flex items-center gap-2 text-success font-medium bg-success/10 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-5 h-5" />
          Metadata removed and files compressed for safer sharing
        </p>
      </motion.div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10 max-w-7xl mx-auto mb-20 px-4">
        <AnimatePresence>
          {files.map((file, i) => (
            <motion.div
              key={`${file.filename || file.origName}-${i}`}
              className="mb-10 break-inside-avoid"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              layout
            >
              <ImgMediaCard file={file} isResults={true} expTime={expTime} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="btn flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-3xl text-xl font-semibold shadow-card hover:shadow-glass mx-auto"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Home className="w-6 h-6" />
          Back to Upload
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Results;
