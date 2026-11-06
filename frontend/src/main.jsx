import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/500.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/700.css";
import App from "./App.jsx";
import "./css/App.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(var(--background-paper), 0.95)",
            color: "rgb(var(--foreground))",
            border: "1px solid rgba(var(--border), 0.6)",
            backdropFilter: "blur(12px)",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
