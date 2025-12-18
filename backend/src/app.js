import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
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
const expirationTimeInSeconds = ((process.env.LINK_EXPIRATION_MINUTES * 60) * 1000);

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
// TODO - Add a function or check to delete all images in the processedDir in case the server fails and needs to be restarted.
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
    // TODO - Write up something more secure than application/octet-stream to handle the .heic files. the image/heic doesn't work...
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/octet-stream', 'image/gif', 'image/bmp', 'image/tiff'];
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
async function processImage(inputPath, outputPath, extension) {
  let commands = [];
  if (extension === '.HEIC') {
    const operatingSystem = process.env.OS.toLowerCase();
    if (operatingSystem.includes('windows')) {
      commands = [
        `magick -format jpg "${inputPath}" "${outputPath}"`,
        `magick.exe mogrify -strip "${outputPath}"`
      ];
    }
    if (process.env.OS === 'linux') {
      commands = [
        `convert -format jpg "${inputPath}" "${outputPath}"`,
        `mogrify -strip "${outputPath}"`
      ];
    }
  } else {
    commands = [
      `magick "${inputPath}" -strip "${outputPath}"`,
      `convert "${inputPath}" -strip "${outputPath}"`
    ];
  }

  for (const command of commands) {
    try {
      console.log(`Executing command: ${command}`);
      await execPromise(command, { shell: true });
      if (extension !== '.HEIC') {
        return; // Success, exit function
      }
    } catch (err) {
      console.error(`Command failed: ${command}`, err);
      if (command === commands[commands.length - 1]) {
        throw err; // Last command failed, throw error
      }
    }
  }
}

// Route to handle file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, originalname } = req.file;
  const { extension } = getFileParts(originalname);
  let outputFilename = '';
  if (extension === '.HEIC') {
    outputFilename = `${uuidv4()}.jpg`;
  } else {
    outputFilename = `${uuidv4()}${extension}`;
  }
  const outputPath = path.join(processedDir, outputFilename);

  try {
    // Process image with ImageMagick
    await processImage(req.file.path, outputPath, extension);

    // Generate a unique access token
    const accessToken = crypto.randomBytes(16).toString('hex');
    const expirationTime = Date.now() + expirationTimeInSeconds; // 60 seconds from now

    // Store token and file info
    fileAccessTokens.set(accessToken, {
      filePath: outputPath,
      fileName: outputFilename,
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
    }, expirationTimeInSeconds);

    // Delete original file
    try {
      await fs.unlink(req.file.path);
    } catch (err) {
      console.error(`Failed to delete ${req.file.path}:`, err);
    }

    // Return unique URL
    let url = '';
    if (process.env.ENVIRONMENT === 'development') {
      url = `http://${req.get('host')}/image/${outputFilename}?token=${accessToken}`;
    } else {
      url = `/api/image/${outputFilename}?token=${accessToken}`;
    }

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
app.get('/api/image/:filename', async (req, res) => {
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

// Route to get image url
app.get('/api/imageUrl', async (req, res) => {
  const { token } = req.query;

  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (process.env.ENVIRONMENT === 'development') {
    const url = `http://${req.get('host')}/api/image/${fileInfo.fileName}?token=${token}`;
    res.send(url)
  } else {
    const url = `/api/image/${fileInfo.fileName}?token=${token}`;
    res.send(url)
  }
})

// Route to get image filename
app.get('/api/imageName', async (req, res) => {
  const { token } = req.query;

  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  res.send(fileInfo.fileName)
})


// Route to get remaining time for image
app.get('/api/countdown', async (req, res) => {
  const { token } = req.query;

  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);

  res.send(fileInfo.expirationTime)
})

// Route to get the expiration time
app.get('/api/expirationTime', async (req, res) => {
  res.send(process.env.LINK_EXPIRATION_MINUTES)
})

if (process.env.ENVIRONMENT === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // To make the node server serve the contents of the dist folder in the frontend/dist
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.all("/*splat/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

app.listen(port, () => console.log(`Server running on port ${port}`));