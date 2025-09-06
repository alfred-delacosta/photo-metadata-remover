import NotFoundSvg from "../Assets/404.svg?react";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <Grid container width={"80%"}>
      <Grid size={12} display="flex" justifyContent="center">
        <NotFoundSvg />
      </Grid>
      <Grid size={12} display="flex" justifyContent="center" marginTop={3}>
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
  );
};

export default NotFound;
