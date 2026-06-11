import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // used in JSX only
import {
  Eye,
  Settings,
  Share2,
  Download,
  Home,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
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
  const [showActions, setShowActions] = useState(false);

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/viewImage/${filename}?token=${token}`;
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      } else {
        // Fallback for older browsers or HTTP contexts
        fallbackCopyTextToClipboard(shareUrl);
      }
    } catch {
      // If clipboard fails, use fallback
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success("Link copied!");
      } else {
        toast.error("Copy failed!");
      }
    } catch {
      toast.error("Copy failed!");
    }
    document.body.removeChild(textArea);
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
    <motion.div
      className="group relative bg-background-paper rounded-3xl shadow-card hover:shadow-glass overflow-hidden h-full flex flex-col transition-all duration-500 border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image with Overlay (hover on desktop, tap-to-toggle on touch) */}
      {imageLink && (
        <div
          className="relative overflow-hidden rounded-t-3xl cursor-pointer select-none"
          onClick={() => setShowActions(!showActions)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowActions(!showActions); } }}
          role="button"
          tabIndex={0}
          aria-label="Toggle quick actions"
        >
          <img src={imageLink} alt={imageName} className="w-full h-48 object-cover" />
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center ${showActions ? 'opacity-100' : 'opacity-0 md:opacity-0 md:group-hover:opacity-100'}`}>
            <div className="flex gap-2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); window.open(`/viewImage/${filename}?token=${token}`, '_blank'); }}
                className="p-2.5 min-w-[44px] min-h-[44px] bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="View Image"
                aria-label="View image"
              >
                <Eye className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); copyLink(); }}
                className="p-2.5 min-w-[44px] min-h-[44px] bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Share Link"
                aria-label="Copy share link"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/viewImage/${filename}?token=${token}`; }}
                className="p-2.5 min-w-[44px] min-h-[44px] bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Resize/Settings"
                aria-label="Reprocess settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-foreground-secondary text-sm mb-1">{preset?.toUpperCase()} / {format?.toUpperCase()}</p>
          <p className="text-foreground font-medium truncate" title={imageName}>{imageName}</p>
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

    </div>
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
    </motion.div>
    )
}
