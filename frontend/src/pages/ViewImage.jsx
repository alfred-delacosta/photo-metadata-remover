import { useParams, useSearchParams } from "react-router";
import ImgMediaCard from "../components/ImgMediaCard";
import { Grid } from "@mui/material";

const ViewImage = () => {
  const { fileName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Grid alignItems={"center"} justifyContent={"center"}>
        <ImgMediaCard fileName={fileName} token={searchParams.get('token')} />
    </Grid>
  )
};

export default ViewImage;
