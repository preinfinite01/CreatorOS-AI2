import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Wire generated React-Query hooks to the production backend when deployed
// separately (Vercel frontend + Render backend). In dev (Replit), VITE_API_URL
// is unset so relative /api/... paths are used via the shared proxy.
setBaseUrl(import.meta.env.VITE_API_URL || null);

createRoot(document.getElementById("root")!).render(<App />);
