export function initHero() {
  const media = document.querySelector<HTMLElement>(".hero__media");
  const video = media?.querySelector<HTMLVideoElement>(".hero__video");
  const playButton = media?.querySelector<HTMLButtonElement>(".hero__play");

  playButton?.addEventListener("click", async () => {
    if (!video) return;

    try {
      await video.play();
      video.controls = true;
    } catch {
      media?.classList.remove("is-playing");
    }
  });

  video?.addEventListener("play", () => media?.classList.add("is-playing"));
  video?.addEventListener("pause", () => media?.classList.remove("is-playing"));
  video?.addEventListener("ended", () => media?.classList.remove("is-playing"));
}
