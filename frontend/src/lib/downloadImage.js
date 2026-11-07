import toast from "react-hot-toast";

/**
 * Save/share an image without navigating the top-level window.
 * iOS standalone PWAs ignore <a download> and leave users stuck on a
 * chrome-less black preview if the document navigates to the image URL.
 */
export async function downloadImage(url, filename = "image") {
  if (!url) {
    toast.error("Image not available");
    return;
  }

  const safeName = String(filename || "image").replace(/[^\w.\-()+ ]+/g, "_") || "image";

  try {
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }
    const blob = await response.blob();
    const type = blob.type || "application/octet-stream";
    const file = new File([blob], safeName, { type });

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: safeName,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
        // Fall through; on iOS standalone avoid any navigation fallback.
      }
    }

    // Never navigate the PWA document to the image (or a blob URL) on iOS standalone —
    // that is what produces the stuck black preview with no back chrome.
    if (isIosStandalone()) {
      toast(
        "To save on iPhone, long-press the image and choose Save to Photos",
        { duration: 6000 }
      );
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = safeName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    }
  } catch {
    if (isIosStandalone()) {
      toast.error("Long-press the image and choose Save to Photos");
    } else {
      toast.error("Download failed");
    }
  }
}

function isIosStandalone() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return standalone && ios;
}
