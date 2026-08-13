import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} else {
  document.body.innerHTML = "<main style='min-height:100vh;display:grid;place-items:center;background:#090814;color:#f5e7b8;font-family:sans-serif;text-align:center;padding:24px'>Astro With Hrishi is loading. Please refresh once.</main>";
}
