import axios from "axios";

const isServer = typeof window === "undefined";

const axiosInstance = axios.create({
  baseURL: isServer
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089")
    : "",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
