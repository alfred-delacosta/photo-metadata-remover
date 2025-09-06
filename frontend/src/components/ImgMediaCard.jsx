import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Grid, Box } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import ShareIcon from "@mui/icons-material/Share";
import { Link } from "react-router";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router";
import Countdown from "react-countdown";

export default function ImgMediaCard({ fileName, token }) {
  const [imageExists, setImageExists] = useState(false);
  const [linkCountdown, setLinkCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmImageExists = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3015/image/${fileName}?token=${token}`
        );
        const resCountdown = await axios.get(
          `http://localhost:3015/countdown?token=${token}`
        );
        setImageExists(true);
        setLinkCountdown(resCountdown.data);
      } catch (error) {
        setImageExists(false);
        navigate(`/NotFound`);
      }
    };

    confirmImageExists();
  }, []);

  function copyLink() {
    try {
    let currentUrl = window.location.href;
    console.log(currentUrl)
      navigator.clipboard.writeText(
        `${currentUrl}`
      );
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
          image={`http://localhost:3015/image/${fileName}?token=${token}`}
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
