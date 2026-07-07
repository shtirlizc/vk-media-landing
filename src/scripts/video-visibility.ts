let observer: IntersectionObserver | undefined;

export function pauseVideoOutsideViewport(video: HTMLVideoElement) {
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const observedVideo = entry.target;

      if (
        observedVideo instanceof HTMLVideoElement &&
        !entry.isIntersecting &&
        !observedVideo.paused
      ) {
        observedVideo.pause();
      }
    });
  });

  observer.observe(video);
}
