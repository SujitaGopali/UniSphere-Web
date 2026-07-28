import crypto from "crypto";

export function parseDeviceLabel(userAgent?: string): string {
  if (!userAgent) return "Unknown device";

  const ua = userAgent.toLowerCase();
  let browser = "Browser";
  let os = "Unknown OS";

  if (ua.includes("edg/")) browser = "Microsoft Edge";
  else if (ua.includes("chrome/") && !ua.includes("edg/")) browser = "Chrome";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "Safari";

  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";

  return `${browser} on ${os}`;
}

export function buildDeviceFingerprint(userAgent?: string): string {
  return crypto.createHash("sha256").update(userAgent || "unknown").digest("hex");
}

export function createSessionId(): string {
  return crypto.randomUUID();
}
