export function initVideos() {
  const players = document.querySelectorAll<HTMLElement>("[data-video-player]");

  players.forEach((player) => {
    const video = player.querySelector<HTMLVideoElement>(
      "[data-video-player-video]",
    );
    const playButton = player.querySelector<HTMLButtonElement>(
      "[data-video-player-play]",
    );

    playButton?.addEventListener("click", async () => {
      if (!video) return;

      try {
        await video.play();
        video.controls = true;
      } catch {
        delete player.dataset.playing;
      }
    });

    video?.addEventListener("play", () => {
      player.dataset.playing = "";
    });
    video?.addEventListener("pause", () => {
      delete player.dataset.playing;
    });
    video?.addEventListener("ended", () => {
      delete player.dataset.playing;
    });
  });
}
