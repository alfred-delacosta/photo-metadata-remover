# 🖼️ Photo Metadata Remover

Welcome to the **Photo Metadata Remover**, a powerful web application designed to strip metadata from images, resize/compress, and support HEIC/JPG/PNG. Built with **Node.js**, **Express.js**, **React.js**, **Sharp**, and **Material UI**, this app combines performance with a modern, user-friendly interface. 🚀 It includes multi-upload, progress tracking, and automatic cleanup for enhanced security. 🕒

🔗 👉🏻 https://pmr.ajscreation.com 

## ✨ Features

- **Metadata Removal & Compression**: Strip EXIF, IPTC, and other metadata, resize/compress with presets using Sharp. 🧹
- **Multi-Upload**: Upload up to 5 images at once. 📤
- **Presets & Formats**: Choose Low/Medium/High/Original presets (1920x1080 default), JPEG/WebP formats. 🎨
- **Progress Tracking**: Real-time processing bars per batch. 📊
- **Results Page**: Grid thumbnails + temp URLs list with copy. 📋
- **Re-Resize**: View page allows re-processing with new options. 🔄
- **Automatic File Cleanup**: Processed images auto-deleted after expiration. 🕒
- **Responsive UI**: Mobile-friendly Material UI. 📱
- **Fast & Secure**: Server-side processing with Sharp for quick operations. 🔒
- **HEIC Support**: Handles HEIC inputs (libheif dep on VPS). 📸

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Sharp, Multer
- **Frontend**: React.js, Vite, Material UI, Axios, Dropzone
- **Image Processing**: Sharp (libvips)

## 🚀 Getting Started

Follow these steps to set up and run the Photo Metadata Remover locally.

### Prerequisites

- **Node.js** (v18 or higher) 🟢
- Modern web browser 🌐
- For HEIC: On VPS/Linux `apt install libheif1`; Windows/Mac handled by Sharp prebuilds.

### Installation

1. **Clone the Repository**:
    ```bash
    git clone <repo>
    cd photo-metadata-remover
    ```

2. **Install Dependencies**:
    ```bash
    npm install  # installs root, backend, frontend deps
    npm run build  # build frontend
    ```

3. **Configure Environment Variables**:
    - Copy `backend/.env-sample` to `backend/.env`:
      ```bash
      cp backend/.env-sample backend/.env
      ```
    - Fill in:
      ```env
      PORT=5000
      ENVIRONMENT=development
      LINK_EXPIRATION_MINUTES=60
      OS=win32  # or linux
      ```

4. **Start the App**:
    ```bash
    npm run start  # root: starts backend (serves frontend in prod)
    ```
    Or dev:
    ```bash
    # Terminal 1: cd backend; npm run dev
    # Terminal 2: cd frontend; npm run dev
    ```

### Usage

1. Open `http://localhost:5000` (dev: frontend separate). 🌍
2. Select preset/format, drag/drop up to 5 images. 📸
3. See upload/progress bars. 📊
4. View results grid + temp URLs list. 📋
5. Click thumbnail for new tab view + re-resize. 🔄
6. Images auto-delete after expiration. 🕒

## 📂 Project Structure

```plaintext
photo-metadata-remover/
├── frontend/                  # React/Vite frontend
│   ├── src/
│   │   ├── components/        # FileUpload, ImgMediaCard
│   │   ├── pages/             # Results, ViewImage
│   │   ├── App.jsx            # Routes
│   │   └── lib/               # Axios
├── backend/                   # Node.js/Express backend
│   ├── src/
│   │   ├── app.js             # Main server
│   │   └── utils/             # fileUtils.js
│   └── package.json
├── README.md                  # You're here! 📖
└── package.json               # Root scripts
```

## 🎨 Customization

- **Presets**: Edit `backend/src/app.js` presets object.
- **Expiration**: Change `LINK_EXPIRATION_MINUTES` in `.env`.
- **Max Files**: Update `maxCount: 5` in multer.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request. 🚀

## 📜 License

ISC.

## 🙏 Acknowledgments

- [Sharp](https://sharp.pixelplumbing.com/) for image processing.
- [Material UI](https://mui.com/) for components.
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) for frameworks.

---

⭐ **Star this repo** if you find it useful! Feel free to open issues or submit PRs to make this project even better. Happy metadata stripping! 🖼️
