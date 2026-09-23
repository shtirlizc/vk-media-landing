import { pauseVideoOutsideViewport } from "./video-visibility.ts";

export function initVideos() {
  const players = document.querySelectorAll<HTMLElement>("[data-video-player]");

  players.forEach((player) => {
    const video = player.querySelector<HTMLVideoElement>(
      "[data-video-player-video]",
    );
    const playbackButton = player.querySelector<HTMLButtonElement>(
      "[data-video-player-playback]",
    );
    const progress = player.querySelector<HTMLInputElement>(
      "[data-video-player-progress]",
    );

    if (!video || !playbackButton) return;

    pauseVideoOutsideViewport(video);

    const loadVideo = () => {
      const source = video.dataset.src;

      if (!source || video.currentSrc || video.src) {
        return;
      }

      video.src = source;
      video.load();
    };

    const togglePlayback = async () => {
      if (!video.paused) {
        video.pause();
        return;
      }

      try {
        loadVideo();
        await video.play();
      } catch {
        delete player.dataset.playing;
      }
    };

    const playbackClickTarget = player.hasAttribute("data-video-player-surface")
      ? player
      : playbackButton;

    playbackClickTarget.addEventListener("click", (event) => {
      if (
        progress &&
        event.target instanceof Node &&
        progress.contains(event.target)
      ) {
        return;
      }

      if (video.controls && event.target === video) {
        return;
      }

      void togglePlayback();
    });

    video.addEventListener("play", () => {
      player.dataset.playing = "";
      playbackButton.setAttribute("aria-label", "Поставить видео на паузу");
    });

    const setPausedState = (ariaLabel: string) => {
      delete player.dataset.playing;
      playbackButton.setAttribute("aria-label", ariaLabel);
    };

    video.addEventListener("pause", () =>
      setPausedState("Продолжить воспроизведение"),
    );
    video.addEventListener("ended", () => setPausedState("Запустить видео"));

    if (progress) {
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
        updateProgress();
      };

      progress.addEventListener("input", () => {
        loadVideo();

        const ratio = Number(progress.value) / 100;
        progress.style.setProperty("--video-progress", `${progress.value}%`);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = ratio * video.duration;
          updateProgress();
          return;
        }

        pendingSeek = ratio;
      });

      video.addEventListener("loadedmetadata", applyPendingSeek);
      video.addEventListener("durationchange", applyPendingSeek);
      video.addEventListener("timeupdate", updateProgress);
    }
  });
}
