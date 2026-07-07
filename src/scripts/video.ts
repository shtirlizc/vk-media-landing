export function initVideos() {
  const players = document.querySelectorAll<HTMLElement>("[data-video-player]");

  players.forEach((player) => {
    const video = player.querySelector<HTMLVideoElement>(
      "[data-video-player-video]",
    );
    const playbackButton = player.querySelector<HTMLButtonElement>(
      "[data-video-player-playback]",
    );

    if (!video || !playbackButton) return;

    playbackButton.addEventListener("click", async () => {
      if (!video.paused) {
        video.pause();
        return;
      }

      try {
        await video.play();
      } catch {
        delete player.dataset.playing;
      }
    });

    video.addEventListener("play", () => {
      player.dataset.playing = "";
      playbackButton.setAttribute("aria-label", "Поставить видео на паузу");
    });

    const setPausedState = (ariaLabel: string) => {
      delete player.dataset.playing;
      playbackButton.setAttribute("aria-label", ariaLabel);
    };

    video.addEventListener("pause", () =>
      setPausedState("Продолжить воспроизведение"),
    );
    video.addEventListener("ended", () => setPausedState("Запустить видео"));
  });
}
