import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const GrokFileUpload = () => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          backgroundColor: isDragActive ? 'primary.light' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the files here!' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to select files
        </Typography>
        <Button variant="contained" color="primary">
          Browse Files
        </Button>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFile(file.name)}
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemText primary={file.name} secondary={file.size} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default GrokFileUpload;