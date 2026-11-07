import { motion } from "framer-motion";
import { Eye, Share2, Download, Home, AlertCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Countdown from "react-countdown";
import { Link } from "react-router";
import { downloadImage } from "../lib/downloadImage";

/**
 * Result card: preview, size savings, download, and share.
 */
export default function ImgMediaCard({ file, isResults = false, expTime }) {
  const { url, origSize, newSize, preset, format, origName, filename, token, error } = file || {};
  const imageLink = url || "";
  const imageName = origName || filename;
  const viewPath = `/viewImage/${filename}?token=${token}`;

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

  const shareOrCopy = async () => {
    const shareUrl = `${window.location.origin}${viewPath}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: imageName || "Processed image",
          text: "View this privacy-stripped image",
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      } else {
        fallbackCopyTextToClipboard(shareUrl);
      }
    } catch {
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  if (error) {
    return (
      <div className="bg-background-paper border border-border/50 rounded-card p-8 flex flex-col items-center text-center h-full shadow-card">
        <AlertCircle className="w-16 h-16 text-error mb-4 opacity-75" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Processing failed</h3>
        <p className="text-foreground-secondary text-sm">{origName}</p>
        <p className="text-error text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="group relative bg-background-paper rounded-card shadow-card hover:shadow-glass overflow-hidden h-full flex flex-col transition-shadow duration-200 border border-border/50"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {imageLink && (
        <div className="relative overflow-hidden rounded-t-card">
          <img src={imageLink} alt={imageName || "Processed image"} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              <Link
                to={viewPath}
                className="focus-ring p-2 min-w-11 min-h-11 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-control text-white hover:bg-white/30 transition-colors"
                aria-label={`View and reprocess ${imageName || "image"}`}
              >
                <Eye className="w-5 h-5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={shareOrCopy}
                className="focus-ring p-2 min-w-11 min-h-11 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-control text-white hover:bg-white/30 transition-colors"
                aria-label={`Share ${imageName || "image"}`}
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </button>
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
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Metadata removed
          </p>
        </div>
        <div className="pt-4 mt-auto grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => downloadImage(imageLink, imageName)}
            className="btn focus-ring flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-control text-sm font-medium"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
          </button>
          {!isResults && (
            <Link
              to="/"
              className="btn focus-ring flex items-center justify-center gap-2 p-3 bg-success text-success-foreground rounded-control text-sm font-medium"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Home
            </Link>
          )}
          {isResults && (
            <button
              type="button"
              onClick={shareOrCopy}
              className="btn focus-ring flex items-center justify-center gap-2 p-3 border border-border rounded-control text-sm font-medium text-foreground"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              Share
            </button>
          )}
        </div>
      </div>
      {isResults && expTime > Date.now() && (
        <div className="p-4 border-t border-border/50 bg-background-elevated text-center">
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
        </div>
      )}
    </motion.div>
  );
}
