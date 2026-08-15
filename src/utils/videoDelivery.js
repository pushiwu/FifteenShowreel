const normalizeBaseUrl = (value = "") => value.trim().replace(/\/+$/, "");

export const VIDEO_CDN_BASE_URL = normalizeBaseUrl(
  import.meta.env?.VITE_VIDEO_CDN_BASE_URL ?? "",
);

export function getVideoDeliveryConfig(baseUrl = VIDEO_CDN_BASE_URL) {
  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    enabled: Boolean(normalizeBaseUrl(baseUrl)),
  };
}

export function getVideoSlug(videoPath = "") {
  const normalizedPath = videoPath.split("?")[0].replace(/^\/+|\/+$/g, "");
  const parts = normalizedPath.split("/").filter(Boolean);
  if (parts[0] === "projects" && parts[1] === "web-video" && parts[2]) {
    return parts[2];
  }
  if (parts.length >= 2 && parts[0] === "projects") {
    return parts[1].replace(/\.[^.]+$/, "");
  }
  const filename = parts.at(-1) ?? "";
  return filename.replace(/\.[^.]+$/, "");
}

export function getHlsUrl(videoPath, baseUrl = VIDEO_CDN_BASE_URL) {
  const config = getVideoDeliveryConfig(baseUrl);
  if (!config.enabled || !videoPath) return "";
  return `${config.baseUrl}/hls/${getVideoSlug(videoPath)}/master.m3u8`;
}

export function supportsNativeHls(videoElement) {
  return Boolean(
    videoElement?.canPlayType?.("application/vnd.apple.mpegurl") ||
      videoElement?.canPlayType?.("application/x-mpegURL"),
  );
}
