import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import ShareIcon from "@mui/icons-material/Share";
import { Link } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Countdown from "react-countdown";

export default function ImgMediaCard({ file }) {
  const { url, origSize, newSize, preset, format, origName, filename, token } = file || {};
  const imageLink = url || '';
  const imageName = origName || filename;
  const [linkCountdown, setLinkCountdown] = useState(0);

  useEffect(() => {
    const fetchCountdown = async () => {
      const res = await api.get(`/countdown?token=${token}`);
      setLinkCountdown(res.data);
    };
    if (token) fetchCountdown();
  }, [token]);

async function copyLink() {
  try {
    const shareUrl = `${window.location.origin}/viewImage/${filename}?token=${token}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  } catch {
    toast.error("Uh oh! Something went wrong!");
  }
}

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        alt={imageName}
        height="250"
        image={imageLink}
        onClick={() => window.open(`/viewImage/${filename}?token=${token}`, "_blank")}
        sx={{ cursor: "pointer", objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {preset} / {format.toUpperCase()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Original: {(origSize / 1024).toFixed(0)} KB → New: {(newSize / 1024).toFixed(0)} KB
          <br />
          <strong>{((1 - newSize / origSize) * 100).toFixed(0)}% smaller</strong>
        </Typography>
      </CardContent>
      <CardActions sx={{ marginTop: "auto", p: 2 }}>
        <Grid
          container
          spacing={1}
          sx={{ justifyContent: "space-around", alignItems: "center", flexGrow: 1 }}
          width="100%"
        >
          <Grid item xs={4}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              href={imageLink}
              download={imageName}
              fullWidth
            >
              Download
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ShareIcon />}
              onClick={copyLink}
              fullWidth
            >
              Share
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Link to="/">
              <Button
                variant="contained"
                size="small"
                startIcon={<HomeIcon />}
                color="success"
                fullWidth
              >
                Home
              </Button>
            </Link>
          </Grid>
          {token && (
            <Grid item xs={12}>
              <Typography variant="caption" align="center" display="block">
                Expires: <Countdown date={linkCountdown} />
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardActions>
    </Card>
  );
}