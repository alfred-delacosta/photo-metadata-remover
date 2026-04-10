import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./css/App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(var(--background-paper), 0.95)',
            color: 'rgb(var(--foreground))',
            border: '1px solid rgba(var(--border), 0.6)',
            backdropFilter: 'blur(20px)',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
