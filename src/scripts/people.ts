export function initPeople() {
  const popover = document.getElementById("popover-people");
  const video = popover?.querySelector("video");
  const playbackButton = popover?.querySelector<HTMLButtonElement>(
    "[data-people-playback]",
  );
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".people__photo[data-video]",
  );

  if (!(video instanceof HTMLVideoElement) || !popover) return;

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

  playbackButton?.addEventListener("click", () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", () => {
    popover.dataset.playing = "";
    playbackButton?.setAttribute("aria-label", "Поставить видео на паузу");
  });

  const setPausedState = () => {
    delete popover.dataset.playing;
    playbackButton?.setAttribute("aria-label", "Продолжить воспроизведение");
  };

  video.addEventListener("pause", setPausedState);
  video.addEventListener("ended", setPausedState);

  popover.addEventListener("toggle", (event) => {
    if (event.newState === "closed") {
      video.removeAttribute("src");
    }
  });
}
