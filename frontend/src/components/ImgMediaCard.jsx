import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import ShareIcon from "@mui/icons-material/Share";
import { Link } from "react-router";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../lib/axios";
import { useNavigate } from "react-router";
import Countdown from "react-countdown";

export default function ImgMediaCard({ fileName, token }) {
  const [imageExists, setImageExists] = useState(false);
  const [linkCountdown, setLinkCountdown] = useState(0);
  const [imageLink, setImageLink] = useState('');
  const [imageName, setImageName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmImageExists = async () => {
      try {
        const res = await api.get(`/image/${fileName}?token=${token}`);
        const resCountdown = await api.get(`/countdown?token=${token}`);
        const resImageUrl = await api.get(`/imageUrl?token=${token}`);
        const resImageName = await api.get(`/imageName?token=${token}`);
        setImageExists(true);
        setLinkCountdown(resCountdown.data);
        setImageLink(resImageUrl.data);
        setImageName(resImageName.data);
      } catch (error) {
        setImageExists(false);
        navigate(`/NotFound`);
      }
    };

    confirmImageExists();
  }, []);

  async function copyLink() {
    try {
      let currentUrl = window.location.href;
      await navigator.clipboard.writeText(`${currentUrl}`);
      toast.success("Link copied!");
    } catch (error) {
      toast.error("Uh oh! Something went wrong!");
    }
  }

  return (
    imageExists && (
      <Card>
        <CardMedia
          component="img"
          alt="uploaded image"
          height="500"
          image={imageLink}
        />
        <CardActions sx={{ padding: "3rem" }}>
          <Grid
            container
            spacing={2}
            sx={{ justifyContent: "space-around", alignItems: "center" }}
            width={"100%"}
          >
            <Grid
              size={{ xs: 12, sm: "auto" }}
              display="flex"
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                href={imageLink}
                download={imageName}
              >
                Download
              </Button>
            </Grid>
            <Grid
              size={{ xs: 12, sm: "auto" }}
              display="flex"
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ShareIcon />}
                onClick={copyLink}
              >
                Copy Link
              </Button>
            </Grid>
            <Grid
              size={{ xs: 12, sm: "auto" }}
              display="flex"
              justifyContent="center"
            >
              <Link to="/">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HomeIcon />}
                  color="success"
                >
                  Back to Upload Page
                </Button>
              </Link>
            </Grid>
            <Grid size={12} textAlign="center" marginTop={3}>
              <Typography variant="h4">
                Link expires in <Countdown date={linkCountdown} />
              </Typography>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    )
  );
}
