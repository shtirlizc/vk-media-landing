export function initVideoProgress(
  video: HTMLVideoElement,
  progress: HTMLInputElement,
) {
  let pendingSeek: number | null = null;

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";

    const totalSeconds = Math.max(0, Math.floor(time));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  const updateProgress = () => {
    const duration = video.duration;
    const value =
      Number.isFinite(duration) && duration > 0
        ? (video.currentTime / duration) * 100
        : 0;

    progress.value = String(value);
    progress.style.setProperty("--video-progress", `${value}%`);
    progress.setAttribute(
      "aria-valuetext",
      `${formatTime(video.currentTime)} из ${formatTime(duration)}`,
    );
  };

  const applyPendingSeek = () => {
    if (
      pendingSeek === null ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    video.currentTime = pendingSeek * video.duration;
    pendingSeek = null;
  };

  const handleMetadataChange = () => {
    applyPendingSeek();
    updateProgress();
  };

  const reset = () => {
    pendingSeek = null;
    progress.value = "0";
    progress.style.setProperty("--video-progress", "0%");
    progress.setAttribute("aria-valuetext", "0:00 из 0:00");
  };

  progress.addEventListener("input", () => {
    const ratio = Number(progress.value) / 100;
    progress.style.setProperty("--video-progress", `${progress.value}%`);

    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = ratio * video.duration;
      updateProgress();
      return;
    }

    pendingSeek = ratio;
  });

  video.addEventListener("loadedmetadata", handleMetadataChange);
  video.addEventListener("durationchange", handleMetadataChange);
  video.addEventListener("timeupdate", updateProgress);

  return { reset };
}

export function initVideos() {
  const players = document.querySelectorAll<HTMLElement>("[data-video-player]");

  players.forEach((player) => {
    const playbackButton = player.querySelector<HTMLButtonElement>(
      "[data-video-player-playback]",
    );
    const iframe = player.querySelector<HTMLIFrameElement>(
      "[data-video-player-iframe]",
    );

    if (!iframe || !playbackButton) return;

    playbackButton.addEventListener(
      "click",
      () => {
        const source = iframe.dataset.src;
        if (!source) return;

        iframe.src = source;
        iframe.hidden = false;
        playbackButton.hidden = true;
        iframe.focus();
      },
      { once: true },
    );
  });
}
