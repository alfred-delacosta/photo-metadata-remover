import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router";
import { Grid, Box, LinearProgress, Typography, Button } from "@mui/material";
import ImgMediaCard from "../components/ImgMediaCard";
import toast from "react-hot-toast";
import api from "../lib/axios";

const Results = () => {
  const { sessionId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get(`/api/session/${sessionId}`);
        setFiles(res.data.files);
        if (res.data.files.length > 0) setLoading(false);
      } catch {
        navigate('/');
      }
    };

    poll();
    const int = setInterval(poll, 1000);
    return () => clearInterval(int);
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Finalizing results...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Processed Images ({files.length})</Typography>
      <Typography variant="h5" gutterBottom sx={{mt:2}}>Temporary URLs (expire soon):</Typography>
      <Box sx={{mb:4}}>
        {files.map((file, i) => (
          <Box key={i} sx={{mb:1, py:1, borderBottom: '1px solid grey.400'}}>
            <a href={file.url} target="_blank" rel="noopener noreferrer" style={{marginRight:16}}>
              {file.filename}
            </a>
            <Button size="small" onClick={() => navigator.clipboard.writeText(file.url || '').then(() => toast.success('Copied!'))}>
              Copy
            </Button>
          </Box>
        ))}
      </Box>
      <Grid container spacing={2}>
        {files.map((file, i) => (
          <Grid item xs={11} sm={12} md={6} lg={4} key={i}>
            <ImgMediaCard file={file} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Results;