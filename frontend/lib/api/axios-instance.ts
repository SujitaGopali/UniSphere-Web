import axios from "axios";

const isServer = typeof window === "undefined";

/** Server actions/proxy: prefer runtime API_BASE_URL, then build-time NEXT_PUBLIC_*. */
function getServerApiBaseUrl() {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8089"
  );
}

const axiosInstance = axios.create({
  // Browser: same-origin `/api/v1/...` → Next proxy. Server: direct backend URL.
  baseURL: isServer ? getServerApiBaseUrl() : "",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default axiosInstance;
