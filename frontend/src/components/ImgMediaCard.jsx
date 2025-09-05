import { useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Grid, Box } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import ShareIcon from "@mui/icons-material/Share";
import { Link } from "react-router";
import toast from "react-hot-toast";

// TODO Do something if the image cannot be found

export default function ImgMediaCard({ fileName, token }) {
  function copyLink() {
    try {
      navigator.clipboard.writeText(
        `http://localhost:3015/image/${fileName}?token=${token}`
      );
      toast.success("Link copied!");
    } catch (error) {
      toast.error("Uh oh! Something went wrong!");
    }
  }

  return (
    <Card>
      <CardMedia
        component="img"
        alt="green iguana"
        height="500"
        image={`http://localhost:3015/image/${fileName}?token=${token}`}
      />
      <CardActions sx={{ padding: "3rem"}}>
        <Grid container spacing={2} sx={{justifyContent: "space-around", alignItems: "center"}} width={"100%"}>
          <Grid size={{ xs: 12, sm: 'auto'}} display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 'auto'}} display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<ShareIcon />}
              onClick={copyLink}
            >
              Copy Link
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 'auto'}} display="flex" justifyContent="center">
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
        </Grid>
      </CardActions>
    </Card>
  );
}
