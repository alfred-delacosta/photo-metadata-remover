import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import api from "../lib/axios";
import { Grid, Box, CardMedia, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, LinearProgress } from "@mui/material";
import Countdown from "react-countdown";
import DownloadIcon from "@mui/icons-material/Download";
import toast from "react-hot-toast";

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
      const res = await api.post(`/api/reprocess?token=${token}`, { preset, format });
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

  if (loading) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

  if (!imageUrl) return <Box sx={{ p: 4 }}><Typography>Image not found</Typography></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={imageName}
            sx={{ width: "100%", height: 500, objectFit: "contain" }}
          />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            href={imageUrl}
            download={imageName}
            fullWidth
            sx={{ mt: 2 }}
            size="large"
          >
            Download
          </Button>
        </Grid>
        <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 5 }}>
              <Typography variant="h5" gutterBottom>Details</Typography>
            <Typography variant="body1"><strong>Preset:</strong> {details.preset}</Typography>
            <Typography variant="body1"><strong>Format:</strong> {details.format}</Typography>
            <Typography variant="body1">
              Original: {(details.origSize / 1024).toFixed(0)} KB → New: {(details.newSize / 1024).toFixed(0)} KB
              <br />
              <strong>{((1 - details.newSize / details.origSize) * 100).toFixed(0)}% smaller</strong>
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Expires in:
              </Typography>
              <Countdown date={linkCountdown} />
            </Box>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Reprocess</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Preset</InputLabel>
                <Select value={preset} label="Preset" onChange={(e) => setPreset(e.target.value)}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="orig">Original</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Format</InputLabel>
                <Select value={format} label="Format" onChange={(e) => setFormat(e.target.value)}>
                  <MenuItem value="jpeg">JPEG</MenuItem>
                  <MenuItem value="webp">WebP</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" fullWidth onClick={handleReprocess} size="large">
                Reprocess
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewImage;