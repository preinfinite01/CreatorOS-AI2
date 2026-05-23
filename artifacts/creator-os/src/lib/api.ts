/**
 * Central API fetch utility.
 *
 * On Replit (dev): VITE_API_URL is unset → API_BASE = '' → relative URLs like
 * '/api/...' are routed through the shared Replit proxy to the API server.
 *
 * On Vercel+Render (production): Set VITE_API_URL = 'https://your-api.render.com'
 * in Vercel's environment variables. All fetch calls become absolute, e.g.
 * 'https://your-api.render.com/api/payments/initialize'.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, options);
}
