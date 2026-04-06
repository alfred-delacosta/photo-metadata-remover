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
  const [expTime, setExpTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get(`/session/${sessionId}`);
        setFiles(res.data.files);
        setExpTime(res.data.expTime);
        if (res.data.files.length > 0) setLoading(false);
      } catch (error) {
        console.error('Session fetch error:', error);
        navigate('/');
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{color: 'primary.main'}}>✅ Processed Images ({files.length})</Typography>
      <Grid container spacing={2}>
        {files.map((file, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <ImgMediaCard file={file} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Results;