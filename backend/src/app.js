import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';
import getFileParts from './utils/fileUtils.js';
import sharp from 'sharp';
import '@dotenvx/dotenvx/config'

console.log('ENVIRONMENT:', process.env.ENVIRONMENT);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');
const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;
const expirationTimeInSeconds = parseInt(process.env.LINK_EXPIRATION_MINUTES) * 60 * 1000;
const sessions = new Map();
const progressMap = new Map();
const fileAccessTokens = new Map();
const presets = {
  low: { maxWidth: 1280, maxHeight: 720, quality: 70 },
  medium: { maxWidth: 1920, maxHeight: 1080, quality: 85 },
  high: { maxWidth: 3840, maxHeight: 2160, quality: 95 },
  orig: { maxWidth: Infinity, maxHeight: Infinity, quality: 100 }
};

const validFormats = ['jpeg', 'webp', 'png', 'heic'];

async function cleanupToken(token) {
  const tokenInfo = fileAccessTokens.get(token);
  if (!tokenInfo) return;
  try {
    await fs.unlink(tokenInfo.filePath);
  } catch (err) {
    console.error(`Failed to delete ${tokenInfo.filePath}:`, err);
  }
  fileAccessTokens.delete(token);
}
if (environment === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
}

app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Cleanup expired sessions and tokens on startup
for (const [sessionId, session] of sessions.entries()) {
  if (Date.now() > session.expTime) {
    cleanupSession(sessionId);
  }
}

for (const [token, info] of fileAccessTokens.entries()) {
  if (Date.now() > info.expirationTime) {
    cleanupToken(token);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const { basename, extension } = getFileParts(file.originalname);
    cb(null, `${basename}-${uuidv4()}${extension}`);
  }
});

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB per file (matches UI copy)

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and HEIC files are allowed'), false);
    }
  }
});

async function processBuffer(buffer, outputPath, preset, format) {
  console.log('Processing image to', outputPath, 'preset:', preset, 'format:', format);
  // sharp strips metadata by default; do not call withMetadata() (including with false),
  // because any withMetadata(...) call keeps input metadata in sharp 0.35+.
  let image = sharp(buffer);
  if (preset.maxWidth !== Infinity) {
    image = image.resize({ width: preset.maxWidth, height: preset.maxHeight, fit: 'inside', withoutEnlargement: true });
  }
  if (format === 'jpeg') {
    image = image.jpeg({ quality: preset.quality });
  } else if (format === 'webp') {
    image = image.webp({ quality: preset.quality });
  } else {
    image = image.toFormat(format);
  }
  await image.toFile(outputPath);
  console.log('Processing complete for', outputPath);
}

async function cleanupSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  for (const fileInfo of session.files) {
    if (fileInfo.token) {
      await cleanupToken(fileInfo.token);
    }
  }
  sessions.delete(sessionId);
  progressMap.delete(sessionId);
}

app.post('/api/upload', upload.fields([{ name: 'files', maxCount: 5 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  console.log('Upload request received');
  const { preset: presetName = 'medium', format = 'jpeg' } = req.body;
  const preset = presets[presetName];
  if (!preset) {
    return res.status(400).json({ error: 'Invalid preset' });
  }
  if (!validFormats.includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  const files = req.files ? Object.values(req.files).flat() : [];
  console.log('Files received:', files.length);
  if (files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const sessionId = uuidv4();
  console.log('SessionId created:', sessionId);
  const session = { files: [], expTime: Date.now() + expirationTimeInSeconds };
  const progress = { processed: 0, total: files.length };
  sessions.set(sessionId, session);
  progressMap.set(sessionId, progress);
  const processFormat = format === 'heic' ? 'heif' : format;
  for (const file of files) {
    const origSize = (await fs.stat(file.path)).size;
    try {
      const outputExt = processFormat === 'heif' ? 'heic' : processFormat;
      const outputFilename = `${uuidv4()}.${outputExt}`;
      const outputPath = path.join(processedDir, outputFilename);
      const buffer = await fs.readFile(file.path);
      await processBuffer(buffer, outputPath, preset, processFormat);
      const newSize = (await fs.stat(outputPath)).size;
      const accessToken = crypto.randomBytes(16).toString('hex');
      const tokenInfo = {
        filePath: outputPath,
        filename: outputFilename,
        origName: file.originalname,
        preset: presetName,
        format,
        origSize,
        newSize,
        expirationTime: session.expTime
      };
      fileAccessTokens.set(accessToken, tokenInfo);
      let url;
      if (environment === 'development') {
        url = `http://${req.get('host')}/api/image/${outputFilename}?token=${accessToken}`;
      } else {
        url = `/api/image/${outputFilename}?token=${accessToken}`;
      }
      session.files.push({ origName: file.originalname, filename: outputFilename, origSize, newSize, preset: presetName, format, token: accessToken, url });
    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err);
      session.files.push({ origName: file.originalname, origSize, preset: presetName, format, error: err.message });
    }
    progress.processed++;
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error(`Failed to delete ${file.path}:`, err);
    }
  }
  setTimeout(() => cleanupSession(sessionId), expirationTimeInSeconds);
  console.log('Sending response with sessionId:', sessionId, 'expTime:', session.expTime);
  res.json({ sessionId, expTime: session.expTime });
});

app.post('/api/reprocess', async (req, res) => {
  const { token } = req.query;
  const { preset: presetName, format } = req.body;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'Expired token' });
  }
  const preset = presets[presetName];
  if (!preset) {
    return res.status(400).json({ error: 'Invalid preset' });
  }
  if (!validFormats.includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  try {
    const buffer = await fs.readFile(fileInfo.filePath);
    const processFormat = format === 'heic' ? 'heif' : format;
    const outputExt = processFormat === 'heif' ? 'heic' : processFormat;
    const outputFilename = `${uuidv4()}.${outputExt}`;
    const outputPath = path.join(processedDir, outputFilename);
    await processBuffer(buffer, outputPath, preset, processFormat);
    const newSize = (await fs.stat(outputPath)).size;
    const newToken = crypto.randomBytes(16).toString('hex');
    const newTokenInfo = {
      filePath: outputPath,
      filename: outputFilename,
      origName: fileInfo.origName,
      preset: presetName,
      format,
      origSize: fileInfo.origSize,
      newSize,
      expirationTime: Date.now() + expirationTimeInSeconds
    };
    fileAccessTokens.set(newToken, newTokenInfo);
    let newUrl;
    if (environment === 'development') {
      newUrl = `http://${req.get('host')}/api/image/${outputFilename}?token=${newToken}`;
    } else {
      newUrl = `/api/image/${outputFilename}?token=${newToken}`;
    }
    res.json({ url: newUrl, token: newToken, preset: presetName, format, newSize });
  } catch (err) {
    console.error('Reprocess error:', err);
    res.status(500).json({ error: 'Reprocess failed' });
  }
});

app.get('/api/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  if (!session || Date.now() > session.expTime) {
    await cleanupSession(sessionId);
    return res.status(403).json({ error: 'Session expired or invalid' });
  }
  res.json({ files: session.files, expTime: session.expTime });
});

app.get('/api/progress/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  if (!session || Date.now() > session.expTime) {
    await cleanupSession(sessionId);
    return res.status(403).json({ error: 'Session expired or invalid' });
  }
  const progress = progressMap.get(sessionId) || { processed: 0, total: 0 };
  res.json(progress);
});

app.get('/api/image/:filename', async (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'URL has expired' });
  }
  const downloadName = path.basename(fileInfo.origName || fileInfo.filename || 'image');
  const safeName = downloadName.replace(/[^\w.\-()+ ]+/g, '_') || 'image';
  const forceDownload = req.query.download === '1' || req.query.download === 'true';
  res.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes, matching link expiration
  // Default to inline so <img> / PWA previews stay in-app. attachment only when explicitly requested.
  // Always-on attachment made iOS standalone navigate to a chrome-less black preview on download taps.
  res.set(
    'Content-Disposition',
    `${forceDownload ? 'attachment' : 'inline'}; filename="${safeName}"`
  );
  res.sendFile(path.resolve(fileInfo.filePath), err => {
    if (err) {
      console.error('File serving error:', err);
      if (!res.headersSent) {
        res.status(404).json({ error: 'File not found' });
      }
    }
  });
});

app.get('/api/imageUrl', async (req, res) => {
  const { token } = req.query;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'URL has expired' });
  }
  let url;
  if (process.env.ENVIRONMENT === 'development') {
    url = `http://${req.get('host')}/api/image/${fileInfo.filename}?token=${token}`;
  } else {
    url = `/api/image/${fileInfo.filename}?token=${token}`;
  }
  res.send(url);
})

app.get('/api/imageName', async (req, res) => {
  const { token } = req.query;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'URL has expired' });
  }
  res.send(fileInfo.filename || fileInfo.origName);
})

app.get('/api/countdown', async (req, res) => {
  const { token } = req.query;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'URL has expired' });
  }
  res.send(fileInfo.expirationTime);
})

app.get('/api/imageDetails', async (req, res) => {
  const { token } = req.query;
  if (!token || !fileAccessTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing token' });
  }
  const fileInfo = fileAccessTokens.get(token);
  if (Date.now() > fileInfo.expirationTime) {
    await cleanupToken(token);
    return res.status(403).json({ error: 'URL has expired' });
  }
  res.json({
    preset: fileInfo.preset,
    format: fileInfo.format.toUpperCase(),
    origSize: fileInfo.origSize,
    newSize: fileInfo.newSize,
    origName: fileInfo.origName
  });
});

app.get('/api/expirationTime', async (req, res) => {
  res.send(process.env.LINK_EXPIRATION_MINUTES);
})

if (process.env.ENVIRONMENT === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distDir = path.join(__dirname, "../../frontend/dist");

  // Serve built frontend; keep the service worker fresh for PWA updates
  app.use(express.static(distDir, {
    setHeaders(res, filePath) {
      const base = path.basename(filePath);
      if (base === 'sw.js' || base.startsWith('workbox-') || base === 'site.webmanifest') {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // SPA fallback for client routes (home-screen launches, refreshes on /results, /viewImage)
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Each file must be 10MB or smaller' });
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Up to 5 images are allowed per upload' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err?.message?.includes('Only JPEG')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));