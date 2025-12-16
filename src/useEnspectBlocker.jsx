// src/hooks/useInspectBlocker.js
import { useEffect } from "react";

export default function useInspectBlocker() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => e.preventDefault();

    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+J
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
