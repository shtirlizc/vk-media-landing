import { pauseVideoOutsideViewport } from "./video-visibility.ts";

export function initPeople() {
  const playbackHideDelay = 1000;
  const popover = document.getElementById("popover-people");
  const video = popover?.querySelector("video");
  const playbackButton = popover?.querySelector<HTMLButtonElement>(
    "[data-people-playback]",
  );
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".people__photo[data-video]",
  );

  if (!(video instanceof HTMLVideoElement) || !popover) return;

  pauseVideoOutsideViewport(video);

  let playbackHideTimer: number | undefined;

  const showPlaybackButton = () => {
    if (playbackHideTimer !== undefined) {
      window.clearTimeout(playbackHideTimer);
      playbackHideTimer = undefined;
    }

    delete popover.dataset.playbackHidden;
  };

  const schedulePlaybackButtonHide = () => {
    showPlaybackButton();
    playbackHideTimer = window.setTimeout(() => {
      popover.dataset.playbackHidden = "";
      playbackHideTimer = undefined;
    }, playbackHideDelay);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const videoUrl = button.dataset.video;

      if (!videoUrl) return;

      video.src = videoUrl;
      video.load();
      popover.showPopover();
      video.play();
    });
  });

  const togglePlayback = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  video.addEventListener("click", togglePlayback);
  playbackButton?.addEventListener("click", togglePlayback);

  video.addEventListener("play", () => {
    popover.dataset.playing = "";
    playbackButton?.setAttribute("aria-label", "Поставить видео на паузу");
    schedulePlaybackButtonHide();
  });

  const setPausedState = () => {
    showPlaybackButton();
    delete popover.dataset.playing;
    playbackButton?.setAttribute("aria-label", "Продолжить воспроизведение");
  };

  video.addEventListener("pause", setPausedState);
  video.addEventListener("ended", setPausedState);

  popover.addEventListener("toggle", (event) => {
    if (event.newState === "closed") {
      showPlaybackButton();
      video.pause();
      video.removeAttribute("src");
    }
  });
}
