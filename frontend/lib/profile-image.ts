const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

/** Resolve stored profile image paths to a browser-loadable URL. */
export function resolveProfileImageUrl(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("http")) {
    return src;
  }

  const path = src.startsWith("/") ? src : `/${src}`;

  // Uploaded files are served by the backend — load them directly.
  if (path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`;
  }

  return path;
}
