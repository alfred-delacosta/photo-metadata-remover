import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router";
import { Grid, Box, LinearProgress, Typography, Button } from "@mui/material";
import { Home } from "@mui/icons-material";
import ImgMediaCard from "../components/ImgMediaCard";
import api from "../lib/axios";

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
    const int = setInterval(poll, 10000); // Poll every 10s to check expiration
    return () => clearInterval(int);
  }, [sessionId, navigate]);

  useEffect(() => {
    if (expTime > 0) {
      localStorage.setItem('photoResults', JSON.stringify({ sessionId, expTime }));
    }
  }, [sessionId, expTime]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Finalizing results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Session Expired or Invalid
        </Typography>
        <Typography variant="body1">
          The results are no longer available. Please upload new images.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Go to Homepage
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{color: 'primary.main', textAlign: 'center'}}>✅ Processed Images ({files.length})</Typography>
      <Grid container spacing={2}>
        {files.map((file, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <ImgMediaCard file={file} isResults={true} expTime={expTime} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" color="primary" size="large" startIcon={<Home />} onClick={() => navigate('/')}>
          Home
        </Button>
      </Box>
    </Box>
  );
};

export default Results;