import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import getFileParts from './utils/fileUtils.js';
// .dotenv initialization
import '@dotenvx/dotenvx/config'

const app = express();
const execPromise = promisify(exec);
const uploadsDir = './src/uploads';
const processedDir = './src/processed';
const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;

if (environment === 'development') {
  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
}

// Serve static files (including index.html)
app.use(express.static(path.join(path.resolve(), 'public')));

// Ensure directories exist
async function ensureDirectories() {
  for (const dir of [uploadsDir, processedDir]) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create directory ${dir}:`, err);
    }
  }
}
ensureDirectories();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const { basename, extension } = getFileParts(file.originalname);
    cb(null, `${basename}-${uuidv4()}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/gif', 'image/bmp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, HEIC, GIF, BMP, and TIFF files are allowed'), false);
    }
  }
});

// Store for tracking file expiration
const fileAccessTokens = new Map();

// Function to try ImageMagick commands
async function processImage(inputPath, outputPath) {
  const commands = [
    `magick "${inputPath}" -strip "${outputPath}"`,
    `convert "${inputPath}" -strip "${outputPath}"`
  ];

  for (const command of commands) {
    try {
      console.log(`Executing command: ${command}`);
      await execPromise(command, { shell: true });
      return; // Success, exit function
    } catch (err) {
      console.error(`Command failed: ${command}`, err);
      if (command === commands[commands.length - 1]) {
        throw err; // Last command failed, throw error
      }
    }
  }
}

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, originalname } = req.file;
  const { extension } = getFileParts(originalname);
  const outputFilename = `${uuidv4()}${extension}`;
  const outputPath = path.join(processedDir, outputFilename);

  try {
    // Process image with ImageMagick
    await processImage(req.file.path, outputPath);

    // Generate a unique access token
    const accessToken = crypto.randomBytes(16).toString('hex');
    const expirationTime = Date.now() + process.env.LINK_EXPIRATION_MINUTES * 60 * 1000; // 60 seconds from now

    // Store token and file info
    fileAccessTokens.set(accessToken, {
      filePath: outputPath,
      expirationTime
    });

    // Schedule file deletion
    setTimeout(async () => {
      if (fileAccessTokens.has(accessToken)) {
        try {
          await fs.unlink(fileAccessTokens.get(accessToken).filePath);
          fileAccessTokens.delete(accessToken);
        } catch (err) {
          console.error(`Failed to delete ${outputPath}:`, err);
        }
      }
    }, 120 * 1000);

    // Delete original file
    try {
      await fs.unlink(req.file.path);
    } catch (err) {
      console.error(`Failed to delete ${req.file.path}:`, err);
    }

    // res.redirect(`/image/${outputFilename}?token=${accessToken}`);

    // Return unique URL
    const url = `http://${req.get('host')}/image/${outputFilename}?token=${accessToken}`;
    res.json({ message: 'File processed successfully', url, fileName: outputFilename, accessToken });
  } catch (err) {
    console.error('Image processing error:', err);
    res.status(500).json({
      error: 'Failed to process image. Ensure ImageMagick is installed and accessible.',
      details: err.message
    });
  }
});

// Route to serve processed image
app.get('/image/:filename', async (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;

  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }

  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    try {
      await fs.unlink(fileInfo.filePath);
      fileAccessTokens.delete(token);
    } catch (err) {
      console.error(`Failed to delete ${fileInfo.filePath}:`, err);
    }
    return res.status(403).json({ error: 'URL has expired' });
  }

  res.sendFile(path.resolve(fileInfo.filePath), err => {
    if (err) {
      console.error('File serving error:', err);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Route to get remaining time for image
app.get('/countdown', async (req, res) => {
  const { token } = req.query;

  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);

  res.send(fileInfo.expirationTime)
})

// Serve index.html for all other routes to support React Router
app.get('/', (req, res) => {
  res.send("Hello")
  // res.sendFile(path.join(path.resolve(), 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));