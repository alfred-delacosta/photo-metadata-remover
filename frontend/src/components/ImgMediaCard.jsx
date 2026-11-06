import { motion } from "framer-motion";
import { Eye, Share2, Download, Home, AlertCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Countdown from "react-countdown";
import { Link } from "react-router";

/**
 * Result card: preview, size savings, download, and share.
 */
export default function ImgMediaCard({ file, isResults = false, expTime }) {
  const { url, origSize, newSize, preset, format, origName, filename, token, error } = file || {};
  const imageLink = url || "";
  const imageName = origName || filename;

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/viewImage/${filename}?token=${token}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      } else {
        fallbackCopyTextToClipboard(shareUrl);
      }
    } catch {
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) toast.success("Link copied!");
      else toast.error("Copy failed!");
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
      {imageLink && (
        <div className="relative overflow-hidden rounded-t-3xl">
          <img src={imageLink} alt={imageName} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => window.open(`/viewImage/${filename}?token=${token}`, "_blank")}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="View and reprocess"
              >
                <Eye className="w-5 h-5" />
              </motion.button>
              <motion.button
                type="button"
                onClick={copyLink}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Share Link"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-foreground-secondary text-sm mb-1">
            {preset?.toUpperCase()} / {format?.toUpperCase()}
          </p>
          <p className="text-foreground font-medium truncate">{imageName}</p>
          <p className="text-sm text-foreground-secondary">
            Original: {Math.round(origSize / 1024)} KB
            {newSize ? (
              <>
                {" "}
                → {Math.round(newSize / 1024)} KB
                <br />
                <span className="font-bold text-success">
                  {origSize > 0
                    ? `${Math.round((1 - newSize / origSize) * 100)}% smaller`
                    : "N/A"}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
            <ShieldCheck className="w-3.5 h-3.5" />
            Metadata removed
          </p>
        </div>
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
          {isResults && (
            <motion.button
              type="button"
              onClick={copyLink}
              className="btn flex items-center justify-center gap-2 p-3 border border-border rounded-2xl text-sm font-medium text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          )}
        </div>
      </div>
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
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </span>
            )}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
