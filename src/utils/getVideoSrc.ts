const DEFAULT_REMOTE_VIDEO_SRC =
  "https://storage.yandexcloud.net/team-hh-email/vk-media-landing";

export function getVideoSrc(name: string) {
  const fileName = `${name}.mp4`;

  if (import.meta.env.DEV) {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${baseUrl}/video/${fileName}`;
  }

  const remoteVideoSrc = (
    import.meta.env.PUBLIC_VIDEO_SRC || DEFAULT_REMOTE_VIDEO_SRC
  ).replace(/\/$/, "");

  return `${remoteVideoSrc}/${fileName}`;
}
