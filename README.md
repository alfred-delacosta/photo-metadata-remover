# 🖼️ Photo Metadata Remover

Welcome to the **Photo Metadata Remover**, a powerful web application designed to strip metadata from images effortlessly using **ImageMagick**. Built with **Node.js**, **Express.js**, **React.js**, and **Material UI**, this app combines performance with a modern, user-friendly interface. 🚀 It also includes an automatic cleanup feature to delete processed images from the server after a set time for enhanced security. 🕒

🔗 https://pmr.ajscreation.com 

## ✨ Features

- **Metadata Removal**: Strip EXIF, IPTC, and other metadata from images with ease using ImageMagick. 🧹
- **Automatic File Cleanup**: Processed images are automatically deleted from the server after a set time to ensure privacy and save space. 🕒
- **Fast & Secure**: Processes images server-side with Node.js and Express.js for quick and secure operations. 🔒
- **Intuitive UI**: Built with React.js and Material UI for a responsive, polished user experience. 🎨
- **Drag-and-Drop Support**: Upload images seamlessly with a drag-and-drop interface. 📤
- **Cross-Platform**: Works on any modern browser, desktop, or mobile. 🌐

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Material UI
- **Image Processing**: ImageMagick
- **Other Tools**: Multer (for file uploads), Axios (for API calls)

## 🚀 Getting Started

Follow these steps to set up and run the Photo Metadata Remover locally.

### Prerequisites

- **Node.js** (v16 or higher) 🟢
- **ImageMagick** installed on your system (`magick` command must be available) 🖌️
- A modern web browser 🌐

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/image-metadata-stripper.git
   cd photo-metadata-remover
   ```

2. **Install Dependencies**:
   ```bash
   npm build
   ```

3. **Install ImageMagick**:
   - On macOS: `brew install imagemagick`
   - On Ubuntu: `sudo apt-get install imagemagick`
   - On Windows: Download and install from [ImageMagick's website](https://imagemagick.org/script/download.php).

4. **Configure Environment Variables**:
   - Copy the `.env-sample` file to `.env`:
     ```bash
     cp .env-sample .env
     ```
   - Open `.env` and fill in the required variables (e.g., `PORT` for the server port).
   - Example `.env` content:
     ```env
     PORT=5000
     ```

5. **Start the Backend**:
   ```bash
   cd backend
   npm start
   ```
   The Express server will run on the port specified in the `.env` file (e.g., `http://localhost:5000`).

6. **Start the Frontend**:
   In a new terminal:
   ```bash
   cd frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`.

### Usage

1. Open your browser and navigate to `http://localhost:3000`. 🌍
2. Drag and drop an image or click to upload. 📸
3. Click the "Strip Metadata" button to process the image. 🧹
4. Download the metadata-free image. 📥 The processed image will be automatically deleted from the server after a set time. 🕒

## 📂 Project Structure

```plaintext
photo-metadata-remover/
├── frontend/                  # React.js frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── App.js             # Main React app
│   │   └── index.js           # Entry point
├── backend/                   # Node.js/Express.js backend
│   ├── routes/                # API routes
│   ├── middleware/            # Multer for file uploads
│   └── app.js                 # Main server file
├── .env-sample                # Template for environment variables
├── package.json               # Project dependencies
└── README.md                  # You're here! 📖
```

## 🎨 Customization

- **Cleanup Timer**: Configure the automatic deletion timer by changing the value of the `LINK_EXPIRATION_MINUTES` in the .env file to adjust how long processed images are retained. 🕒

## 🤝 Contributing

We welcome contributions! 🙌 Follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request. 🚀

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](GPL-3.0) file for details. 📄

## 🙏 Acknowledgments

- [ImageMagick](https://imagemagick.org/) for powerful image processing.
- [Material UI](https://mui.com/) for beautiful components.
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) for robust frameworks.

---

⭐ **Star this repo** if you find it useful! Feel free to open issues or submit PRs to make this project even better. Happy metadata stripping! 🖼️
