/**
 * Resolve a stored image path to its full URL.
 *
 * - Cloudinary images are already absolute URLs (https://res.cloudinary.com/...)
 *   → return as-is.
 * - Local /uploads/... paths (legacy dev only) need the backend base URL prepended.
 *   → Derive from VITE_API_URL by stripping the "/api" suffix.
 *
 * In production both backend and frontend are served from the same origin
 * OR images are on Cloudinary, so this is just a safety fallback.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/api\/?$/, "");

/**
 * @param {string|null|undefined} src  - raw value stored in MongoDB (photo / image field)
 * @returns {string|null}              - resolved URL, or null if src is falsy
 */
export const getImageUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${API_BASE}${src}`;
};
