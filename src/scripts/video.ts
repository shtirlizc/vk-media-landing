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
