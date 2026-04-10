import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  Settings, 
  Share2, 
  Download, 
  Home,
  AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Countdown from "react-countdown";
import { Link } from "react-router";

/**
 * Modern ImgMediaCard - Premium Card with Hover Overlay
 * 
 * Redesigned for 2026 aesthetics:
 * - Image with hover overlay revealing quick actions (fade-in, scale)
 * - Metadata panel that slides in on hover
 * - Responsive sizing with perfect aspect ratio
 * - Glassmorphic buttons with spring hovers
 * - Error state with clean iconography
 * 
 * Why? Cards feel alive and interactive without overwhelming. Hover reveals
 * create delight and reduce clutter. Inspired by Stripe's product cards.
 */
export default function ImgMediaCard({ file, isResults = false, expTime }) {
  const { url, origSize, newSize, preset, format, origName, filename, token, error } = file || {};
  const imageLink = url || '';
  const imageName = origName || filename;
  const [linkCountdown, setLinkCountdown] = useState(0);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const res = await api.get(`/countdown?token=${token}`);
        setLinkCountdown(res.data);
      } catch {
        toast.error('Failed to load countdown');
      }
    };
    if (token) fetchCountdown();
  }, [token]);

  const copyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/viewImage/${filename}?token=${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Copy failed!");
    }
  };

  if (error) {
    return (
      <motion.div 
        className="bg-background-paper border border-border/50 rounded-3xl p-8 flex flex-col items-center text-center h-full shadow-card hover:shadow-glass transition-all duration-300"
        whileHover={{ y: -2 }}
      >
        <AlertCircle className="w-16 h-16 text-error mb-4 opacity-75" />
        <h3 className="text-lg font-bold text-foreground mb-2">Processing Failed</h3>
        <p className="text-foreground-secondary text-sm">{origName}</p>
        <p className="text-error text-sm mt-1">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.article 
      className="group relative bg-background-paper rounded-3xl shadow-card hover:shadow-glass overflow-hidden h-full flex flex-col transition-all duration-500 border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image with hover overlay */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={imageLink}
          alt={imageName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 p-4 transition-all duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.button
            onClick={() => window.open(`/viewImage/${filename}?token=${token}`, "_blank")}
            className="p-3 bg-primary/90 backdrop-blur-sm rounded-2xl border text-primary-foreground hover:bg-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          {isResults && (
            <>
              <motion.button
                onClick={() => window.open(`/viewImage/${filename}?token=${token}`, "_blank")}
                className="p-3 bg-accent/90 backdrop-blur-sm rounded-2xl border text-accent-foreground hover:bg-accent"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={copyLink}
                className="p-3 bg-foreground/90 backdrop-blur-sm rounded-2xl border text-background hover:bg-foreground"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Metadata - Slide up on hover */}
      <motion.div 
        className="p-6 flex-1 flex flex-col justify-between"
        animate={{ y: isResults ? 0 : "auto" }}
      >
        <div>
          <p className="text-foreground-secondary text-sm mb-1">{preset?.toUpperCase()} / {format?.toUpperCase()}</p>
          <p className="text-foreground font-medium truncate">{imageName}</p>
          <p className="text-sm text-foreground-secondary">
            Original: {Math.round(origSize / 1024)} KB
            {newSize && (
              <>
                {" "}→ {Math.round(newSize / 1024)} KB
                <br />
                <span className="font-bold text-success">
                  {origSize > 0 ? `${Math.round((1 - newSize / origSize) * 100)}% smaller` : "N/A"}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Action Buttons - Compact grid */}
        <div className="pt-4 mt-auto grid grid-cols-2 gap-2">
          <motion.a
            href={imageLink}
            download={imageName}
            className="btn flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Download
          </motion.a>
          {!isResults && (
            <motion.div className="btn flex items-center justify-center gap-2 p-3 bg-success text-success-foreground rounded-2xl text-sm font-medium">
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Countdown if in results */}
      {isResults && expTime > Date.now() && (
        <motion.div 
          className="p-4 border-t border-border/50 bg-background-elevated text-center"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
        >
          <p className="text-xs text-foreground-secondary mb-1">Expires in:</p>
          <Countdown
            date={expTime}
            renderer={({ hours, minutes, seconds }) => (
              <span className="font-mono text-sm font-bold text-accent">
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            )}
          />
        </motion.div>
      )}
    </motion.article>
  );
}
