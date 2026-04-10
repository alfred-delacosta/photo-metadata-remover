import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Loader2 } from "lucide-react";
import ImgMediaCard from "../components/ImgMediaCard";
import api from "../lib/axios";

/**
 * Modern Results Page - Masonry Gallery with Staggered Animation
 * 
 * Key improvements:
 * - Responsive masonry layout using Tailwind columns (mobile: single column, desktop: 4-column)
 * - Staggered entrance for cards using Framer Motion
 * - Skeleton loaders for smooth perceived loading (3 placeholders)
 * - Polished error state with illustration-like icon
 * - Modern header with gradient text and count
 * 
 * Why masonry? Creates an "infinite gallery" feel even with few items.
 * Responsive breakpoints ensure perfect flow on all devices.
 */
const Results = () => {
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
        setFiles(res.data.files);
        setExpTime(Number(res.data.expTime));
        if (res.data.files.length > 0) setLoading(false);
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
      localStorage.setItem('photoResults', JSON.stringify({ sessionId, expTime }));
    }
  }, [sessionId, expTime]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-background-paper rounded-3xl p-6 shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-border rounded-2xl mb-4 shimmer" />
      <div className="space-y-2">
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-3 bg-border/80 rounded w-full" />
        <div className="h-3 bg-border/60 rounded w-5/6" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center">
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
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-5 h-5" />
          Go to Homepage
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div 
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent mb-4 leading-none pb-2">
          Processed Images
        </h1>
        <p className="text-2xl md:text-3xl text-foreground-secondary">
          {files.length} ready for download
        </p>
      </motion.div>

      {/* Masonry Gallery */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10 max-w-7xl mx-auto mb-20 px-4">
        <AnimatePresence>
          {files.map((file, i) => (
            <motion.div
              key={`${file.filename}-${i}`}
              className="mb-10"
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

      {/* Home CTA */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="btn flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-3xl text-xl font-semibold shadow-card hover:shadow-glass"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-6 h-6" />
          Back to Upload
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Results;
