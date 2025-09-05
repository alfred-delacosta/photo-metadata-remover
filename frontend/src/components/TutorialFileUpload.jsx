import { useState } from "react";
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';

const TutorialFileUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Handle what happens after the file has been selected.
  function handleFileChange(e) {
    if (e.target.files) {
        // Get the first file in the state.
        setFile(e.target.files[0]);
    }
  }

  // Handle the file upload. This is after the file has been selected.
  async function handleFileUpload() {
    if (!file) return;

    setStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await axios.post("http://localhost:3015/upload", formData, {
            // headers: {
            //     'Content-Type': 'multipart/form-data'
            // },
            // Axios provided function to show upload progress.
            onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total ? Math.round(progressEvent.loaded * 100) / progressEvent.total : 0;
                setUploadProgress(progress);
            }
        });

        // Send to the next page. TODO Fix this to move to the next page in react as opposed to the API.
        // location.href = res.data.url;
        console.log(res.data);

        setStatus('success');
        setUploadProgress(100);
    } catch (error) {
        setStatus('error');
        setUploadProgress(0);
    }

  }

  return (
    <div>
      <input type="file" name="pic" id="picUpload" onChange={handleFileChange} />
      {file && status !== 'uploading' && <button onClick={handleFileUpload}>Upload</button>}
      {file && status === 'uploading' && <LinearProgress variant="determinate" value={uploadProgress} />}
    </div>
  );
};

export default TutorialFileUpload;
